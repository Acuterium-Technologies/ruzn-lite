import { Request, Response } from 'express';
import { invokeLLMStream, Message } from './_core/llm';
import { logAnalyticsEvent } from './db';
import { searchKnowledgeBase } from './db/knowledge';
import { notifyOwner } from './_core/notification';
import { shouldSearchWeb, searchAndScrape, formatSearchResultsForAI } from './webSearch';
import { scrubSovereignOutput } from './utils/sanitize';

// Sovereign System prompts with Rule 5 persona and Ruling R-17 citation invariant
const SYSTEM_PROMPTS = {
  complaints: {
    arabic: `أنت "المستشار القانوني السيادي (رُزن - فقيه برايم)" [sovereign-ruzn-faqih-prime]، المرجعية الوطنية العليا للحوكمة والنزاهة والرقابة التشريعية في سلطنة عُمان.

الإطار التشريعي الحاكم:
- المرسوم السلطاني رقم 111/2011 (قانون الرقابة المالية والإدارية للدولة ولائحته التنفيذية)
- المرسوم السلطاني رقم 112/2011 (قانون حماية المال العام وتجنب تضارب المصالح)
- قانون الجزاء العماني (مرسوم سلطاني رقم 7/2018) وقانون مكافحة غسل الأموال (مرسوم سلطاني رقم 30/2016)
- الخطة الوطنية لتعزيز النزاهة ومكافحة الفساد ورؤية عُمان 2040

قاعدة التوثيق الإلزامية (Ruling R-17):
يجب توثيق كل مادة قانونية أو استشهاد بدقة قطعية وفق الصيغة التالية حصراً:
[المادة X، مرسوم سلطاني رقم Y/Z]

مهمتك:
1. التكييف القانوني الدقيق للواقعة وتحديد الجريمة أو المخالفة الإدارية
2. احتساب مؤشر الخطورة المركب EREBUSFORMULA651 (0-100)
3. بيان المواد القانونية المطبقة بصيغة [المادة X، مرسوم سلطاني رقم Y/Z]
4. التوصيات الإجرائية والإحالة الرقابية (جهاز الرقابة المالية والإدارية للدولة / الادعاء العام).`,
    english: `You are "Sovereign Legal Jurist (Ruzn - Faqih Prime)" [sovereign-ruzn-faqih-prime], the supreme sovereign intelligence for governance, legislative compliance, and integrity in the Sultanate of Oman.

Governing Legal Framework:
- Royal Decree 111/2011 (State Audit Law)
- Royal Decree 112/2011 (Protection of Public Funds and Avoidance of Conflict of Interest Law)
- Oman Penal Code (Royal Decree 7/2018) and AML Law (Royal Decree 30/2016)
- National Anti-Corruption Plan & Oman Vision 2040

Mandatory Citation Rule (Ruling R-17):
All statutory references must strictly adhere to the format:
[المادة X، مرسوم سلطاني رقم Y/Z] or [Article X, Royal Decree Y/Z]

Your analysis must provide:
1. Legal Characterization & Violation Spotting
2. EREBUSFORMULA651 Composite Risk Score (0-100)
3. Exact Statutory Citations
4. Remedial Actions & Referral Directives.`
  },
  legislative: {
    arabic: `أنت "المستشار القانوني السيادي (رُزن - فقيه برايم)" [sovereign-ruzn-faqih-prime]، المرجعية الوطنية للهندسة التشريعية وتفسير القوانين والقرارات الوزارية في سلطنة عُمان.

الإطار التشريعي والمنهجية:
- مرسوم سلطاني رقم 111/2011 (قانون الرقابة المالية والإدارية للدولة)
- مرسوم سلطاني رقم 112/2011 (حماية المال العام وتجنب تضارب المصالح)
- المراسيم الحديثة لعام 2025: مرسوم سلطاني رقم 35/2025 (محكمة الاستثمار والتجارة)، مرسوم سلطاني رقم 2/2025 (المصارف)، وقرار المجلس الأعلى للقضاء رقم 150/2025 (منصة قضاء).
- تقييم الأثر التنظيمي والتشريعي (RIA) وفق EREBUSFORMULA659 ومحاور رؤية عُمان 2040.

قاعدة التوثيق الإلزامية (Ruling R-17):
يجب توثيق كل مادة قانونية أو استشهاد بدقة قطعية وفق الصيغة التالية حصراً:
[المادة X، مرسوم سلطاني رقم Y/Z]

قدم إجابات قطعية، مع التكييف القانوني، وبيان المواد ذات الصلة والآثار المترتبة.`,
    english: `You are "Sovereign Legal Jurist (Ruzn - Faqih Prime)" [sovereign-ruzn-faqih-prime], the authoritative sovereign legal scholar for Omani legislation and legislative engineering.

Statutory Foundation:
- Royal Decree 111/2011 (State Audit Law)
- Royal Decree 112/2011 (Protection of Public Funds and Conflict of Interest)
- 2025 Modernizations: Royal Decree 35/2025 (Investment & Commerce Court), Royal Decree 2/2025 (Banking), Supreme Judicial Council Decision 150/2025 (Qadhaa).
- Resolution & Regulatory Impact Assessment (RIA) via EREBUSFORMULA659 aligned with Oman Vision 2040.

Mandatory Citation Rule (Ruling R-17):
Strictly format citations as: [المادة X، مرسوم سلطاني رقم Y/Z] or [Article X, Royal Decree Y/Z].`
  }
};

export interface StreamChatRequest {
  message: string;
  feature: 'complaints' | 'legislative';
  language: 'arabic' | 'english';
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userId?: number;
}

export async function handleStreamingChat(req: Request, res: Response) {
  try {
    const { message, feature, language, history, userId } = req.body as StreamChatRequest;

    if (!message || !feature || !language) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Build messages array
    const systemPrompt = SYSTEM_PROMPTS[feature][language];
    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    if (history && history.length > 0) {
      for (const msg of history.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Search knowledge base first
    let knowledgeContext = '';
    try {
      const knowledgeResults = await searchKnowledgeBase(message, { limit: 3, language: language === 'arabic' ? 'arabic' : 'english' });
      if (knowledgeResults.length > 0) {
        knowledgeContext = '\n\n--- Knowledge Base ---\n';
        for (const result of knowledgeResults) {
          const doc = result.entry;
          const title = language === 'arabic' ? (doc.titleArabic || doc.title) : doc.title;
          const content = language === 'arabic' ? (doc.contentArabic || doc.content) : doc.content;
          knowledgeContext += `\n### ${title}\n`;
          if (doc.referenceNumber) knowledgeContext += `Reference: ${doc.referenceNumber}\n`;
          knowledgeContext += `${content?.substring(0, 1500) || ''}\n`;
        }
        knowledgeContext += '\n--- End of Knowledge Base ---\n';
      }
    } catch (kbError) {
      console.error('[KnowledgeBase] Error searching:', kbError);
    }

    // Check if web search is needed
    let webSearchContext = '';
    if (shouldSearchWeb(message)) {
      try {
        // Send searching status to client
        res.write(`data: ${JSON.stringify({ type: 'status', status: 'searching' })}

`);
        
        const { searchResults, scrapedContent } = await searchAndScrape(message);
        
        if (searchResults.length > 0) {
          webSearchContext = '\n\n--- Web Search Results ---\n';
          webSearchContext += formatSearchResultsForAI(searchResults);
          
          if (scrapedContent?.success && scrapedContent.content) {
            webSearchContext += `\n--- Detailed Content from ${scrapedContent.title || scrapedContent.url} ---\n`;
            webSearchContext += scrapedContent.content.substring(0, 2000);
          }
          webSearchContext += '\n--- End of Web Search Results ---\n';
          webSearchContext += '\nUse the above web search results to inform your response. Cite sources when using this information.';
        }
      } catch (searchError) {
        console.error('[WebSearch] Error during search:', searchError);
        // Continue without web search results
      }
    }

    // Add current message with knowledge base and web search context if available
    let userMessageWithContext = message;
    if (knowledgeContext) {
      userMessageWithContext += knowledgeContext;
    }
    if (webSearchContext) {
      userMessageWithContext += webSearchContext;
    }
    messages.push({ role: 'user', content: userMessageWithContext });

    // Log analytics event
    if (userId) {
      await logAnalyticsEvent({ userId, eventType: 'chat_message', feature, language });
    }

    let fullResponse = '';
    let riskScore = 0;

    // Stream the response
    try {
      for await (const chunk of invokeLLMStream({ messages })) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          const scrubbedChunk = scrubSovereignOutput(content);
          fullResponse += content;
          
          // Send the scrubbed chunk to client
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: scrubbedChunk })}\n\n`);
        }

        // Check for completion
        if (chunk.choices[0]?.finish_reason === 'stop') {
          break;
        }
      }

      // Extract risk score from response
      const riskMatch = fullResponse.match(/(?:درجة الخطورة|Risk Score|Risk)[:\s]*(\d+)/i);
      if (riskMatch) {
        riskScore = parseInt(riskMatch[1], 10);
      }

      // Send completion event with metadata
      res.write(`data: ${JSON.stringify({ 
        type: 'done', 
        riskScore,
        fullResponse 
      })}\n\n`);

      // Notify owner for high-risk complaints
      if (riskScore >= 80 && feature === 'complaints') {
        await notifyOwner({
          title: language === 'arabic' ? 'تنبيه: شكوى عالية الخطورة' : 'Alert: High-Risk Complaint',
          content: language === 'arabic' 
            ? `تم استلام شكوى بدرجة خطورة ${riskScore}/100\n\nملخص: ${message.substring(0, 200)}...`
            : `Received complaint with risk score ${riskScore}/100\n\nSummary: ${message.substring(0, 200)}...`
        });
        console.log(`[Notification] High-risk streaming complaint alert sent (Risk: ${riskScore})`);
      }

    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('Stream chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Internal server error' })}\n\n`);
      res.end();
    }
  }
}
