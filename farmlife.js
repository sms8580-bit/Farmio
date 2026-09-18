// ==========================================
// 1. 농사 성향 테스트 (MBTI)
// ==========================================
const mbtiQuestions = [
    { type: 'EI', dir: 1, id: 'q1', q: '농사일로 바쁜 하루가 끝났을 때, 나는 동네 이웃 농가 사람들과 떠들썩하게 어울리는 것을 좋아한다.' },
    { type: 'EI', dir: 1, id: 'q2', q: '내가 키운 농산물을 판매할 때, 시끌벅적한 장터에 나가 사람들과 직접 소통하며 파는 것이 즐겁다.' },
    { type: 'EI', dir: -1, id: 'q3', q: '새로운 농업 박람회가 열려도 직접 가기보다는 집에서 인터넷으로 조용히 자료만 검색해 보는 것을 선호한다.' },
    { type: 'SN', dir: 1, id: 'q4', q: '새로운 작물 재배에 도전할 때, 농업기술센터의 매뉴얼과 주변의 검증된 데이터를 철저히 따르는 편이다.' },
    { type: 'SN', dir: 1, id: 'q5', q: '밭을 갈 때 미래에 스마트 농장을 운영하는 상상보다는 당장 오늘 끝내야 할 작업량에 온전히 집중한다.' },
    { type: 'SN', dir: -1, id: 'q6', q: '비룟값을 아끼기 위해 기존의 방식보다는 유튜브나 커뮤니티에서 본 새롭고 기발한 대체 농법을 시도해 보는 편이다.' },
    { type: 'TF', dir: 1, id: 'q7', q: '공들여 키운 작물이 폭우로 망가졌을 때, 속상한 감정보다는 당장의 피해액과 내년 대비책이 먼저 떠오른다.' },
    { type: 'TF', dir: 1, id: 'q8', q: '이웃 농부가 농사를 망쳤다고 하소연할 때, 깊은 위로보다는 문제의 원인을 분석하고 현실적인 조언을 해주는 편이다.' },
    { type: 'TF', dir: -1, id: 'q9', q: '작물에게 물을 줄 때, 정확한 수치를 계산하기보다는 "얘들아 시원하지? 무럭무럭 자라라~" 하며 교감하는 편이다.' },
    { type: 'JP', dir: 1, id: 'q10', q: '다가오는 농번기를 앞두고, 파종부터 수확까지 달력에 꼼꼼하게 날짜와 할 일을 미리 계획해 두는 편이다.' },
    { type: 'JP', dir: 1, id: 'q11', q: '갑자기 비가 와서 오늘 계획한 밭일을 못하게 되면, 유연하게 대처하기보다는 당초 계획이 틀어져서 스트레스를 받는다.' },
    { type: 'JP', dir: -1, id: 'q12', q: '나의 농기구 창고는 완벽하게 각 잡혀 정리되기보다는, 다소 어지럽더라도 나만 알 수 있는 나름의 질서 속에 두는 편이다.' }
];

const mbtiResults = {
    INTJ: { title: "용의주도한 전략가 (INTJ)", desc: "독창적인 아이디어를 바탕으로 철저한 계획을 세우는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>빅데이터와 효율성을 중시하여 농장의 생산성을 극대화하는 지능형 대농장주 스타일입니다. 주먹구구식 농법을 싫어하고 확실한 데이터와 메뉴얼을 바탕으로 접근합니다." },
    INTP: { title: "논리적인 사색가 (INTP)", desc: "호기심이 많아 남들이 안 하는 독창적인 방식을 조용히 연구하는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>남들이 잘 안 키우는 특용작물이나 독특한 농법에 관심이 많은 괴짜 연구원 스타일입니다. 혼자만의 농장 연구소에서 혁신을 만들어냅니다." },
    ENTJ: { title: "대담한 통솔자 (ENTJ)", desc: "뛰어난 리더십과 비전을 가지고 목표를 달성해내는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>농업을 하나의 거대한 비즈니스로 보고 장기적인 투자와 체계적인 관리로 농장을 확장해 나가는 카리스마 리더형 영농 사업가입니다." },
    ENTP: { title: "뜨거운 논쟁을 즐기는 변론가 (ENTP)", desc: "기존의 관습을 거부하고 톡톡 튀는 아이디어로 혁신을 추구하는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>남들이 다 하는 일반적인 농법보다는 스마트팜 기술이나 자율주행 등 새로운 기술 도입에 거부감이 없는 혁신적인 발명가 스타일입니다." },
    INFJ: { title: "선의의 옹호자 (INFJ)", desc: "자신만의 확고한 철학과 신념을 바탕으로 사람과 자연을 위하는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>자연의 섭리를 깊이 이해하고, 땅과 작물을 훼손하지 않는 친환경/유기농업을 추구하는 자연 철학자 스타일입니다." },
    INFP: { title: "열정적인 중재자 (INFP)", desc: "상상력이 풍부하고 감수성이 깊으며 낭만을 즐기는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>작물 하나하나에 이름을 붙여주고 바람 소리를 즐기며 자연 속에서 힐링하는 감성 충만 로맨티스트 농부 스타일입니다." },
    ENFJ: { title: "정의로운 사회운동가 (ENFJ)", desc: "타인의 성장을 돕고 따뜻한 리더십으로 공동체를 긍정적으로 이끄는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>나 혼자 잘 벌기보다는 이웃 농가들과 노하우를 공유하며 상생을 이끄는 마을의 따뜻한 정신적 지주이자 멘토 스타일입니다." },
    ENFP: { title: "재기발랄한 활동가 (ENFP)", desc: "틀에 박힌 것을 싫어하며 자유롭고 창의적인 에너지가 넘치는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>지루한 농사 반복 작업보다는 농촌 체험 캠프, 카페 겸업 등 자유롭고 독창적인 비즈니스를 농업과 결합하는 트렌드세터입니다." },
    ISTJ: { title: "청렴결백한 논리주의자 (ISTJ)", desc: "책임감이 강하고 규칙과 매뉴얼을 철저하게 지키는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>농업기술센터의 매뉴얼을 철저히 지키며, 묵묵하게 가장 확실하고 안정적인 풍년을 만들어내는 정석파 베테랑 농부입니다." },
    ISFJ: { title: "용감한 수호자 (ISFJ)", desc: "따뜻한 마음으로 주변 사람들을 챙기고 헌신적인 사랑을 베푸는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>내 가족이 먹는다는 생각으로 보이지 않는 곳까지 세심하게 정성을 들여 작물을 키워내는 정성 가득 친환경 농부 스타일입니다." },
    ESTJ: { title: "엄격한 관리자 (ESTJ)", desc: "현실적이고 철저한 계획을 바탕으로 조직과 상황을 체계적으로 관리하는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>파종부터 수확까지 일정을 칼같이 지키며 효율적인 배치로 오차 없이 농장을 운영해내는 철두철미한 대농장주 스타일입니다." },
    ESFJ: { title: "사교적인 외교관 (ESFJ)", desc: "사람들과의 화합을 중요시하고 주변 사람을 잘 챙기는 따뜻한 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>동네 대소사를 다 챙기며 이웃들과의 품앗이나 마을 행사를 가장 즐겁게 이끌어가는 이장님 감성의 인싸 농부 스타일입니다." },
    ISTP: { title: "만능 재주꾼 (ISTP)", desc: "호기심이 많고 도구 다루는 능력이 뛰어나 문제를 직접 해결하는 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>트랙터, 관리기 등 고장 난 농기계를 뚝딱 고쳐내며, 어떤 장비든 능숙하게 다루어 혼자서도 일당백을 해내는 농기계 마스터입니다." },
    ISFP: { title: "호기심 많은 예술가 (ISFP)", desc: "현재의 순간을 즐기며 미적 감각이 뛰어나고 자유로운 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>수확의 경쟁이나 이윤 추구보다는 예쁜 꽃과 나무를 심으며 농장을 아름답게 가꾸는 것에 큰 행복을 느끼는 자유로운 예술 농부입니다." },
    ESTP: { title: "모험을 즐기는 사업가 (ESTP)", desc: "생각보다 행동이 먼저! 활동적이고 직관적인 문제 해결 능력이 뛰어난 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>고민하기 전에 일단 땅부터 파고 보는 엄청난 추진력으로, 척박한 환경이나 위기 상황도 빠른 임기응변으로 돌파하는 행동대장입니다." },
    ESFP: { title: "자유로운 영혼의 연예인 (ESFP)", desc: "어디서나 주위 사람들을 즐겁게 만들고 에너지 넘치는 긍정적인 성격입니다.<br><br><strong>🌾 농사 성향:</strong><br>밭일할 때도 노동요를 크게 틀어놓고 흥겹게 일하며, 힘든 농사일도 긍정적인 마인드로 즐기는 농촌의 분위기 메이커입니다." }
};


// ==========================================
// 2. 나의 작물 찾기 테스트
// ==========================================
const cropQuestions = [
    { type: 'CARE', dir: 1, id: 'cq1', q: '나는 손이 많이 가더라도 세심하게 돌보며 키우는 작물 재배 과정 자체에 보람을 느낀다.' },
    { type: 'CARE', dir: -1, id: 'cq2', q: '물이나 비료를 매일 신경 쓸 필요 없이 손이 적게 가고 쑥쑥 혼자 잘 자라는 작물이 좋다.' },
    { type: 'SPACE', dir: 1, id: 'cq3', q: '베란다 화분이나 작은 주말농장 같은 아기자기한 소규모 공간에서 키우는 것을 선호한다.' },
    { type: 'SPACE', dir: -1, id: 'cq4', q: '넓은 노지 밭이나 스마트 온실에서 시원시원하게 큰 규모로 재배해 보고 싶다.' },
    { type: 'USE', dir: 1, id: 'cq5', q: '수확 후 바로 식탁에 올려 싱싱하게 요리해 먹을 수 있는 쌈채소나 채소류를 선호한다.' },
    { type: 'USE', dir: -1, id: 'cq6', q: '두고두고 보관해 먹거나 주변에 선물하기 좋은 구황작물, 과일, 또는 카페용 특용작물이 좋다.' }
];

const cropResults = {
    STBERRY: { name: "🍓 방울토마토 & 딸기", title: "정성 가득 아기자기 홈 가드너", desc: "손길이 닿을수록 탐스럽게 열매 맺는 정성형 작물입니다.<br><br><strong>🌱 추천 이유:</strong><br>베란다나 작은 주말농장에서도 키우기 좋고, 매일 자라는 모습과 빨갛게 익어가는 열매를 보며 깊은 성취감을 느낄 수 있습니다." },
    LETTUCE: { name: "🥬 상추 & 로즈마리", title: "초보도 성공하는 무한수확 힐링 파트너", desc: "손이 많이 가지 않고 잎을 따면 또 자라나는 효자 작물입니다.<br><br><strong>🌱 추천 이유:</strong><br>키우기 매우 쉬우며 뜯어서 바로 샐러드나 쌈으로 먹을 수 있어 실용성과 힐링을 동시에 챙길 수 있습니다." },
    POTATO: { name: "🍠 고구마 & 감자", title: "땅 속에서 보물을 찾는 든든한 흙손 농부", desc: "심어두고 묵묵히 기다리면 땅속 가득 풍성한 결실을 주는 작물입니다.<br><br><strong>🌱 추천 이유:</strong><br>손이 비교적 적게 가고 저장성이 뛰어나 수확 후에도 든든하게 가족, 이웃과 나눌 수 있습니다." },
    APPLE: { name: "🍎 사과 & 샤인머스캣", title: "체계적인 기술과 정성의 고부가가치 과수원주", desc: "높은 재배 기술과 체계적인 관리가 결합되어 높은 가치를 창출하는 고급 과수 작물입니다.<br><br><strong>🌱 추천 이유:</strong><br>농업 기술과 환경 제어를 활용하여 최고의 품질을 달성하는 기쁨을 선사합니다." }
};


// ==========================================
// DOM Loaded & Event Binding
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. MBTI 질문 렌더링
    const mbtiContainer = document.getElementById('mbti-question-list');
    if (mbtiContainer) {
        let html = '';
        mbtiQuestions.forEach((q, index) => {
            html += `
                <div class="mbti-question-card" id="q-card-${index}">
                    <div class="mbti-q-num" style="color: #65b891; font-size: 1.8rem; font-weight: 900; margin-bottom: 10px; letter-spacing: -1px;">Q${index + 1}</div>
                    <div class="mbti-q-title">${q.q}</div>
                    
                    <div class="mbti-scale-container">
                        <span class="scale-label agree">그렇다</span>
                        <div class="scale-options">
                            <input type="radio" name="${q.id}" id="${q.id}_a3" value="3"><label for="${q.id}_a3" class="scale-btn agree-3"></label>
                            <input type="radio" name="${q.id}" id="${q.id}_a2" value="2"><label for="${q.id}_a2" class="scale-btn agree-2"></label>
                            <input type="radio" name="${q.id}" id="${q.id}_a1" value="1"><label for="${q.id}_a1" class="scale-btn agree-1"></label>
                            
                            <input type="radio" name="${q.id}" id="${q.id}_n0" value="0"><label for="${q.id}_n0" class="scale-btn neutral"></label>
                            
                            <input type="radio" name="${q.id}" id="${q.id}_d1" value="-1"><label for="${q.id}_d1" class="scale-btn disagree-1"></label>
                            <input type="radio" name="${q.id}" id="${q.id}_d2" value="-2"><label for="${q.id}_d2" class="scale-btn disagree-2"></label>
                            <input type="radio" name="${q.id}" id="${q.id}_d3" value="-3"><label for="${q.id}_d3" class="scale-btn disagree-3"></label>
                        </div>
                        <span class="scale-label disagree">그렇지 않다</span>
                    </div>
                </div>
            `;
        });
        mbtiContainer.innerHTML = html;
    }

    // 2. 작물 찾기 질문 렌더링
    const cropContainer = document.getElementById('crop-question-list');
    if (cropContainer) {
        let html = '';
        cropQuestions.forEach((q, index) => {
            html += `
                <div class="mbti-question-card" id="cq-card-${index}">
                    <div class="mbti-q-num" style="color: #4a8c6f; font-size: 1.8rem; font-weight: 900; margin-bottom: 10px; letter-spacing: -1px;">Q${index + 1}</div>
                    <div class="mbti-q-title">${q.q}</div>
                    
                    <div class="mbti-scale-container">
                        <span class="scale-label agree">그렇다</span>
                        <div class="scale-options">
                            <input type="radio" name="${q.id}" id="${q.id}_a3" value="3"><label for="${q.id}_a3" class="scale-btn agree-3"></label>
                            <input type="radio" name="${q.id}" id="${q.id}_a2" value="2"><label for="${q.id}_a2" class="scale-btn agree-2"></label>
                            <input type="radio" name="${q.id}" id="${q.id}_a1" value="1"><label for="${q.id}_a1" class="scale-btn agree-1"></label>
                            
                            <input type="radio" name="${q.id}" id="${q.id}_n0" value="0"><label for="${q.id}_n0" class="scale-btn neutral"></label>
                            
                            <input type="radio" name="${q.id}" id="${q.id}_d1" value="-1"><label for="${q.id}_d1" class="scale-btn disagree-1"></label>
                            <input type="radio" name="${q.id}" id="${q.id}_d2" value="-2"><label for="${q.id}_d2" class="scale-btn disagree-2"></label>
                            <input type="radio" name="${q.id}" id="${q.id}_d3" value="-3"><label for="${q.id}_d3" class="scale-btn disagree-3"></label>
                        </div>
                        <span class="scale-label disagree">그렇지 않다</span>
                    </div>
                </div>
            `;
        });
        cropContainer.innerHTML = html;
    }
});


// ==========================================
// 계산 및 결과 출력 함수
// ==========================================
function calculateMBTI() {
    let scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    let answeredCount = 0;

    mbtiQuestions.forEach(q => {
        const radios = document.getElementsByName(q.id);
        let answered = false;
        for (let radio of radios) {
            if (radio.checked) {
                answered = true;
                const val = parseInt(radio.value);
                scores[q.type] += (val * q.dir);
                break;
            }
        }
        if (answered) answeredCount++;
    });

    if (answeredCount < mbtiQuestions.length) {
        alert("모든 질문에 답해주세요!");
        return;
    }

    let resultMBTI = "";
    resultMBTI += (scores.EI > 0) ? "E" : "I";
    resultMBTI += (scores.SN > 0) ? "S" : "N";
    resultMBTI += (scores.TF > 0) ? "T" : "F";
    resultMBTI += (scores.JP > 0) ? "J" : "P";

    const res = mbtiResults[resultMBTI];
    const resultArea = document.getElementById("mbti-result-area");
    if (resultArea) {
        resultArea.classList.remove("mbti-result-hidden");
        resultArea.style.display = "block";
        resultArea.innerHTML = `
            <span class="result-type-label">나의 MBTI 농사 성향은?</span>
            <h1 class="result-title">${res.title}</h1>
            <div class="result-desc">${res.desc}</div>
            <button class="mbti-outline-btn mt-4" style="margin-top:40px;" onclick="location.reload();">테스트 다시하기</button>
        `;
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function calculateCrop() {
    let scores = { CARE: 0, SPACE: 0, USE: 0 };
    let answeredCount = 0;

    cropQuestions.forEach(q => {
        const radios = document.getElementsByName(q.id);
        let answered = false;
        for (let radio of radios) {
            if (radio.checked) {
                answered = true;
                const val = parseInt(radio.value);
                scores[q.type] += (val * q.dir);
                break;
            }
        }
        if (answered) answeredCount++;
    });

    if (answeredCount < cropQuestions.length) {
        alert("모든 질문에 답해주세요!");
        return;
    }

    let cropKey = "STBERRY";
    if (scores.CARE > 0 && scores.SPACE > 0) {
        cropKey = "STBERRY";
    } else if (scores.CARE <= 0 && scores.USE > 0) {
        cropKey = "LETTUCE";
    } else if (scores.SPACE <= 0 && scores.USE <= 0) {
        cropKey = "POTATO";
    } else {
        cropKey = "APPLE";
    }

    const res = cropResults[cropKey];
    const resultArea = document.getElementById("crop-result-area");
    if (resultArea) {
        resultArea.classList.remove("mbti-result-hidden");
        resultArea.style.display = "block";
        resultArea.innerHTML = `
            <span class="result-type-label">나에게 어울리는 최고의 작물은?</span>
            <h1 class="result-title">${res.name}</h1>
            <h3 style="color:#111; font-size:1.3rem; font-weight:700; margin-bottom:15px;">"${res.title}"</h3>
            <div class="result-desc">${res.desc}</div>
            <button class="mbti-outline-btn mt-4" style="margin-top:40px;" onclick="location.reload();">테스트 다시하기</button>
        `;
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ==========================================
// 3. 탭 전환 시 테스트 초기화 함수
// ==========================================
function resetTestForm(targetContainer) {
    if (!targetContainer) return;
    
    // 라디오 버튼 선택 해제
    const radios = targetContainer.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.checked = false;
    });

    // 결과 창 숨기기 및 내용 비우기
    const resultAreas = targetContainer.querySelectorAll('.mbti-result-area');
    resultAreas.forEach(area => {
        area.classList.add('mbti-result-hidden');
        area.style.display = 'none';
        area.innerHTML = '';
    });
}


// ==========================================