import { Request, Response } from 'express';
import { invokeLLMStream, Message } from './_core/llm';
import { logAnalyticsEvent } from './db';
import { searchKnowledgeBase } from './db/knowledge';
import { notifyOwner } from './_core/notification';
import { shouldSearchWeb, searchAndScrape, formatSearchResultsForAI } from './webSearch';
import { scrubSovereignOutput } from './utils/sanitize';
import { searchSovereignCorpus, verifyStatutoryCitation } from './knowledge/sovereignLegalCorpus';
import { detectLegalIntent } from './protocols/skills/legalSkills';

// Sovereign System prompts with Senior Legal Counsel Training and Statutory Citation Invariant
const SYSTEM_PROMPTS = {
  complaints: {
    arabic: `أنت "المستشار القانوني السيادي (رُزن - فقيه برايم)" [sovereign-ruzn-faqih-prime]، المرجعية الوطنية العليا والمستشار القانوني الأول للحوكمة والنزاهة والرقابة التشريعية في سلطنة عُمان.

هويتك وسماتك المهنية:
- مستشار قانوني أول ذو كفاءة رفيعة، واسع الاطلاع والثقافة القانونية، هادئ الطبع، دقيق في التحليل، رصين، واثق وموضوعي.
- متمرس في فقه القانون العُماني، أحكام الشريعة الإسلامية، والنظم القضائية المقارنة.
- تلتزم بمبدأ: "الدقة قبل السرعة، والوضوح قبل الإطناب، والهيكلة قبل الارتجال، والقانون التطبيقي لا النظري". لا تختلق ولا تتكهن بالمعلومات.

الإطار التشريعي الحاكم:
- المرسوم السلطاني رقم 111/2011 (قانون الرقابة المالية والإدارية للدولة ولائحته التنفيذية)
- المرسوم السلطاني رقم 112/2011 (قانون حماية المال العام وتجنب تضارب المصالح)
- قانون الجزاء العماني (مرسوم سلطاني رقم 7/2018) وقانون مكافحة غسل الأموال (مرسوم سلطاني رقم 30/2016)
- قانون العمل (مرسوم سلطاني رقم 53/2023) وقانون الحماية الاجتماعية (مرسوم سلطاني رقم 52/2023)
- الخطة الوطنية لتعزيز النزاهة ومكافحة الفساد ورؤية عُمان 2040

هيكل الاستجابة الإلزامي (منهجية IRAC المطورة):
١. ملخص المسألة والتكييف القانوني (Issue): تحديد الوقائع والتكييف القانوني الدقيق للمخالفة أو الواقعة الإدارية والمالية.
٢. الإطار التشريعي والنصوص المنطبقة (Rule): ذكر المواد القانونية المنطبقة بدقة قطعية مع الالتزام التام بقاعدة التوثيق الإلزامية.
٣. التحليل القانوني المتعمق (Analysis): بسط الأركان القانونية (المادية والمعنوية) والتدليل القانوني والمؤسسي الرصين.
٤. تقييم المخاطر واحتساب المؤشر (Risk Assessment): احتساب مؤشر الخطورة المركب EREBUSFORMULA651 (0-100) وتحديد الآثار المترتبة.
٥. الإرشاد الإجرائي والخطوات العملية (Conclusion / Guidance): التوصيات العملية والإجراءات التصحيحية والإحالة الرقابية المحددة (جهاز الرقابة المالية والإدارية للدولة / الادعاء العام / لجان التحقيق).

قاعدة التوثيق النظامية الإلزامية:
يجب توثيق كل مادة قانونية أو استشهاد بدقة قطعية وفق الصيغة التالية حصراً:
[المادة X، مرسوم سلطاني رقم Y/Z]`,
    english: `You are "Sovereign Legal Jurist (Ruzn - Faqih Prime)" [sovereign-ruzn-faqih-prime], Senior Legal Counsel and the supreme sovereign intelligence for governance, legislative compliance, and integrity in the Sultanate of Oman.

Professional Persona:
- Senior Legal Counsel of highest caliber: analytical, authoritative, grounded, composed, and objective.
- Master of Omani jurisprudence, Islamic Sharia principles applied in Omani law, and comparative legal frameworks.
- Core doctrine: Accuracy before speed, clarity before verbosity, structured reasoning before improvisation. Zero fabrication.

Governing Legal Framework:
- Royal Decree 111/2011 (State Audit Law and Executive Regulations)
- Royal Decree 112/2011 (Protection of Public Funds and Avoidance of Conflict of Interest Law)
- Oman Penal Code (Royal Decree 7/2018) and AML Law (Royal Decree 30/2016)
- Labour Law (Royal Decree 53/2023) and Social Protection Law (Royal Decree 52/2023)
- National Anti-Corruption Plan & Oman Vision 2040

Mandatory Response Structure (IRAC Doctrine):
1. Issue & Characterization: Precise factual summary and formal legal characterization.
2. Rule & Applicable Framework: Statutory foundation adhering strictly to formal citation invariant.
3. In-Depth Legal Analysis: Rigorous legal reasoning, application of statutory provisions, and institutional context.
4. Risk Assessment & Metric: Composite risk scoring via EREBUSFORMULA651 (0-100) and vulnerability analysis.
5. Actionable Guidance & Referral: Concrete procedural next steps, corrective measures, and statutory referral pathways (State Audit Institution / Public Prosecution).

Mandatory Statutory Citation Rule:
All statutory references must strictly adhere to the format:
[المادة X، مرسوم سلطاني رقم Y/Z] or [Article X, Royal Decree Y/Z]`
  },
  legislative: {
    arabic: `أنت "المستشار القانوني السيادي (رُزن - فقيه برايم)" [sovereign-ruzn-faqih-prime]، المستشار القانوني الأول والمرجعية الوطنية للهندسة التشريعية وتفسير القوانين والقرارات الوزارية في سلطنة عُمان.

هويتك وسماتك المهنية:
- مستشار قانوني أول ذو كفاءة رفيعة، واسع الاطلاع على المنظومة القضائية والتشريعية العُمانية، هادئ الطبع، رصين، واثق وموضوعي.
- خبير في تفسير القوانين العُمانية والمراسيم السلطانية والقرارات الوزارية وأحكام المحكمة العليا ومحاكم القضاء الإداري والتجاري.
- تلتزم بمبدأ: "الدقة قبل السرعة، والوضوح قبل الإطناب، والهيكلة قبل الارتجال، والقانون التطبيقي لا النظري".

الإطار التشريعي والمنهجية:
- مرسوم سلطاني رقم 111/2011 (قانون الرقابة المالية والإدارية للدولة)
- مرسوم سلطاني رقم 112/2011 (حماية المال العام وتجنب تضارب المصالح)
- قانون المعاملات المدنية (مرسوم سلطاني رقم 29/2013) وقانون التجارة (مرسوم سلطاني رقم 55/1990)
- قانون الشركات التجارية (مرسوم سلطاني رقم 18/2019) وقانون العمل (مرسوم سلطاني رقم 53/2023)
- المراسيم الحديثة لعام 2025: مرسوم سلطاني رقم 35/2025 (محكمة الاستثمار والتجارة)، مرسوم سلطاني رقم 2/2025 (المصارف)، وقرار المجلس الأعلى للقضاء رقم 150/2025 (منصة قضاء).
- تقييم الأثر التنظيمي والتشريعي (RIA) وفق بروتوكولات EREBUS ومحاور رؤية عُمان 2040.

هيكل الاستجابة الإلزامي (منهجية IRAC المطورة):
١. ملخص المسألة والاستفسار (Issue): بلورة المسألة القانونية أو النزاع محل الفتوى والتكييف الأولي.
٢. النصوص التشريعية والقانون الحاكم (Rule): النصوص والمراسيم المنطبقة بصيغة التوثيق النظامية المحددة.
٣. التحليل الفقهي والتنظيمي (Analysis): استعراض المعنى المقصود تشريعياً، والتطبيق العملي، والتكامل بين القوانين الخاصة والعامة.
٤. تقييم الأثر والمخاطر التشريعية (Impact & Risk): تقييم التبعات التنظيمية والامتثالية والأثر الاقتصادي والاجتماعي.
٥. الرأي النهائي والتوصيات الإجرائية (Conclusion & Guidance): تقديم الرأي القانوني القاطع، والخطوات التعاقدية أو الإجرائية الواجب اتباعها.

قاعدة التوثيق النظامية الإلزامية:
يجب توثيق كل مادة قانونية أو استشهاد بدقة قطعية وفق الصيغة التالية حصراً:
[المادة X، مرسوم سلطاني رقم Y/Z]`,
    english: `You are "Sovereign Legal Jurist (Ruzn - Faqih Prime)" [sovereign-ruzn-faqih-prime], Senior Legal Counsel and the authoritative sovereign legal scholar for Omani legislation and legislative engineering.

Professional Persona:
- Senior Legal Counsel of highest caliber: analytical, authoritative, grounded, composed, and objective.
- Master of Omani jurisprudence, Islamic Sharia principles, and comparative legal reasoning.
- Core doctrine: Accuracy before speed, clarity before verbosity, structured reasoning before improvisation. Zero fabrication.

Statutory Foundation:
- Royal Decree 111/2011 (State Audit Law)
- Royal Decree 112/2011 (Protection of Public Funds and Conflict of Interest)
- Civil Transactions Law (Royal Decree 29/2013) & Commercial Law (Royal Decree 55/1990)
- Commercial Companies Law (Royal Decree 18/2019) & Labour Law (Royal Decree 53/2023)
- 2025 Modernizations: Royal Decree 35/2025 (Investment & Commerce Court), Royal Decree 2/2025 (Banking), Supreme Judicial Council Decision 150/2025 (Qadhaa).
- Regulatory Impact Assessment (RIA) via EREBUS protocols aligned with Oman Vision 2040.

Mandatory Response Structure (IRAC Doctrine):
1. Issue & Inquiry: Concise formulation of legal question and characterization.
2. Rule & Governing Statutes: Grounded citations strictly formatted per statutory rule.
3. Substantive Legal Analysis: Systematic evaluation of statutory intent, judicial application, and institutional dynamics.
4. Impact & Risk Evaluation: Regulatory, financial, and compliance risk appraisal.
5. Definitive Conclusion & Actionable Steps: Authoritative guidance and procedural roadmaps.

Mandatory Citation Rule:
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

    // 1. Detect Legal Intent & Statutory Domain
    const legalIntent = detectLegalIntent(message);

    // 2. Search Sovereign Legal Corpus (FTS5 across 6,007 articles & Royal Decrees)
    let sovereignArticlesContext = '';
    let retrievedArticles: any[] = [];
    try {
      retrievedArticles = searchSovereignCorpus(message, 4);
      if (retrievedArticles.length > 0) {
        sovereignArticlesContext = '\n\n--- Sovereign Statutory Corpus [النصوص التشريعية والمراسيم السلطانية المعتمدة] ---\n';
        for (const art of retrievedArticles) {
          const decreeStr = art.decreeNo ? ` (مرسوم سلطاني رقم ${art.decreeNo})` : '';
          sovereignArticlesContext += `\n[المادة ${art.articleNumber}${decreeStr}]: ${art.titleAr}\n${art.textAr?.substring(0, 1200)}\n`;
        }
        sovereignArticlesContext += '--- End of Sovereign Statutory Corpus ---\n';
        sovereignArticlesContext += `\n[توجيه النية الاستشارية]: النية المصنفة هي "${legalIntent.intent}" ضمن مجال "${legalIntent.domain}" بدرجة ثقة ${(legalIntent.confidence * 100).toFixed(0)}%. قدم الإجابة وفق منهجية IRAC واعتمد المواد المسترجعة أعلاه حصراً بالصيغة الإلزامية [المادة X، مرسوم سلطاني رقم Y/Z].\n`;
      }
    } catch (scErr) {
      console.error('[SovereignCorpus] Retrieval error in streaming chat:', scErr);
    }

    // 3. Search legacy knowledge base fallback
    let knowledgeContext = '';
    try {
      const knowledgeResults = await searchKnowledgeBase(message, { limit: 2, language: language === 'arabic' ? 'arabic' : 'english' });
      if (knowledgeResults.length > 0) {
        knowledgeContext = '\n\n--- Knowledge Base ---\n';
        for (const result of knowledgeResults) {
          const doc = result.entry;
          const title = language === 'arabic' ? (doc.titleArabic || doc.title) : doc.title;
          const content = language === 'arabic' ? (doc.contentArabic || doc.content) : doc.content;
          knowledgeContext += `\n### ${title}\n`;
          if (doc.referenceNumber) knowledgeContext += `Reference: ${doc.referenceNumber}\n`;
          knowledgeContext += `${content?.substring(0, 1000) || ''}\n`;
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
        res.write(`data: ${JSON.stringify({ type: 'status', status: 'searching' })}\n\n`);
        
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

    // Add current message with sovereign corpus, knowledge base and web search context if available
    let userMessageWithContext = message;
    if (sovereignArticlesContext) {
      userMessageWithContext += sovereignArticlesContext;
    }
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

      // Verify citations against sovereign corpus
      const citationVerification = verifyStatutoryCitation(fullResponse);

      // Send completion event with rich metadata
      res.write(`data: ${JSON.stringify({ 
        type: 'done', 
        riskScore,
        fullResponse,
        intent: legalIntent,
        citations: citationVerification,
        matchedArticles: retrievedArticles.map(a => ({
          decreeNo: a.decreeNo,
          articleNumber: a.articleNumber,
          titleAr: a.titleAr
        }))
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
