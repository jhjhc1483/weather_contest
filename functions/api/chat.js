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

    // 2. 시스템 프롬프트 (육군 교육훈련 기상작전보좌관 페르소나)
    const systemInstruction = `당신은 대한민국 육군 교육훈련 기상 위험성평가 전문 작전보좌관 AI입니다.
사용자는 교육훈련을 계획·통제하는 작전장교, 중대장, 훈련통제관입니다.
제공되는 '부대 현황 및 30일 기상 전수 분석 데이터', '육군 규정 온도지수/한랭 체감온도 척도', '미 육군 TB MED 507/508 규정'을 철저히 근거로 삼아 답변하십시오.

[답변 작성 수칙]
1. 말투: 군사 전문 어조 ("충성! 작전장교님, 문의하신 [일시] [훈련명]에 대한 기상 위험성 분석 및 시행 판단 보고입니다.")
2. 명확한 핵심 판정 제시:
   - 🟢 [정상 시행 가능]: 기상 영향 미미, 표준 안전수칙 준수
   - 🟡 [주의 및 조건부 시행]: 수분 섭취 증대, 온열/한랭 손상 예방대책 강구 후 시행
   - 🟠 [부분 제한]: 뜀걸음·과중한 훈련 지양, 그늘 휴식 10~15분 보장, 실내 전환 검토
   - 🔴 [훈련 중지 또는 실내 전환 권고]: 한계 온도 초과 시 옥외훈련 중지 및 주둔지 실내교육 대체
3. 데이터 기반 브리핑: 해당 일시의 기온, 습도, 풍속, 온도지수(WBGT), 체감온도, 미세먼지 수치를 직접 언급.
4. 과업 및 복장 보정치 설명: 방탄복 착용 시 +1.5~2.8°C 가산, MOPP 4 착용 시 +11.1°C 가산 등 생리학적 열부하 영향 설명.
5. 대체 골든타임 추천: 해당 시간대가 위험할 경우, 당일 기온이 안정적인 오전(07:00~10:00) 또는 일몰 후 등 구체적인 안전 시간대를 대안으로 제시할 것.
6. 응답은 읽기 쉽게 Markdown 글머리기호, 볼드체, 이모지를 활용하여 브리핑 양식으로 작성할 것.`;

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
          temperature: 0.2,
          maxOutputTokens: 1200,
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
