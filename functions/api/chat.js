/**
 * Cloudflare Pages Functions - Gemini 2.5 Flash Military Weather AI Assistant API
 * POST /api/chat
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { query, weatherContext, history, clientApiKey } = body;

    // 1. API 키 확인 (환경변수 우선, 없으면 클라이언트 제공 키 사용)
    const apiKey = env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "API_KEY_REQUIRED",
        message: "Gemini API 키가 설정되지 않았습니다. 챗봇 상단 설정(⚙️)에서 Google AI Studio API 키를 입력해 주세요."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // 2. 시스템 프롬프트 (육군 교육훈련 기상작전보좌관 페르소나 - 대화형 티키타카 강화)
    const systemInstruction = `당신은 대한민국 육군 교육훈련 기상 위험성평가 전문 작전보좌관 AI입니다.
사용자는 교육훈련을 계획·통제하는 작전장교, 중대장, 훈련통제관입니다.
제공되는 '부대 현황 및 30일 기상 전수 분석 데이터', '육군 규정 온도지수/한랭 체감온도 척도', '미 육군 TB MED 507/508 규정'을 철저히 근거로 삼아 답변하십시오.

[★ 핵심 대화 원칙: 지휘관과의 능동적 작전 대화 (티키타카 상호작용)]
1. 날짜 및 시간 인식: 당신의 시공간적 기준은 항상 '대한민국 표준시 (KST, UTC+9)'입니다. 사용자의 질문("오늘", "내일", "이번 주", "이번 달", "주말" 등)은 주입된 컨텍스트의 대한민국 표준시 현재 날짜를 절대 기준으로 해석하십시오.
2. 말투: 유능하고 신속정확한 군사 전문 어조 ("충성! 작전장교님...")
3. 질문 정보가 포괄적이거나 모호할 때 (예: "이번달 사격 언제가 좋아?", "행군 언제 가능해?", "훈련 계획 어떻게 짤까?"):
   - 절대 한 번에 지루하고 긴 벽보고서를 일방적으로 쏟아내지 마십시오.
   - 현재 시스템에 설정된 부대(논산 또는 양평)를 기준으로 1~2문장의 핵심 개황을 간결히 먼저 말씀드린 후,
   - **반드시 구체적인 조건을 되물어보는 '역질문(Clarification)'을 던져 지휘관과 티키타카를 이어가십시오!**
   - 예시 패턴:
     "충성! 이번 달 30일 데이터 분석 결과, 전반적으로 3주차(16~20일)의 기상 여건이 가장 양호합니다.
      더 정밀하게 최적의 안전 훈련창을 도출해 드리기 위해 2가지만 여쭙겠습니다:
      ① 훈련 실시 부대가 현재 설정된 **충남 논산(육군훈련소)** 기준이 맞으십니까? (양평 지역도 즉시 분석 가능합니다.)
      ② 계획하시는 훈련 시간대가 **오전(09:00~12:00)**입니까, **오후(13:00~17:00)**입니까?
      ③ 복장은 **단독군장(방탄헬멧)**입니까, **방탄복/완전군장** 착용입니까?
      말씀해 주시면 해당 조건에 맞춘 위험 피크 시간대와 1분 단위 안전 골든타임을 정확히 보고드리겠습니다!"
4. 사용자가 조건을 답하며 대화가 이어질 때:
   - 이전 대화 맥락을 완벽히 계승하여, 지휘관이 지정한 지역/시간대/복장에 따른 구체적 판정(정상/주의/부분제한/중지), 기상 지표(기온/WBGT/미세먼지), TB MED 보정치, 대체 골든타임을 명쾌하게 제시하십시오.
5. 모든 답변 끝에는 사용자가 다음 행동을 취하기 쉬운 간결한 유도 멘트나 옵션을 덧붙이십시오.
6. Markdown 글머리기호, 볼드체, 위험 등급 뱃지 이모지(🟢, 🟡, 🟠, 🔴)를 적극 활용하여 가독성을 높이십시오.`;

    // 3. 메시지 컨텐츠 구성
    const contents = [];

    // 대화 히스토리가 있으면 추가
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-6)) { // 최근 6턴만 유지
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // 현재 사용자 프롬프트에 기상 컨텍스트 결합
    const promptText = `[현재 부대 및 기상 데이터 컨텍스트]
${weatherContext || '현재 등록된 기상 데이터 참조'}

[작전장교 질의]
${query}`;

    contents.push({
      role: 'user',
      parts: [{ text: promptText }]
    });

    // 4. Gemini 2.5 Flash API 호출
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2500,
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      })
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      const errMsg = errData.error?.message || `Gemini API 호출 실패 (HTTP ${geminiRes.status})`;
      return new Response(JSON.stringify({
        error: "GEMINI_API_ERROR",
        message: errMsg
      }), {
        status: geminiRes.status,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const data = await geminiRes.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주십시오.";

    return new Response(JSON.stringify({
      success: true,
      reply: replyText,
      model: "gemini-2.5-flash"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "SERVER_ERROR",
      message: err.message || "서버 내부 오류가 발생했습니다."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
