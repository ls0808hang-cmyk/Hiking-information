class DifficultyCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title') || '난이도';
        const icon = this.getAttribute('icon') || '🏔️';
        const status = this.getAttribute('status') || 'default';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    --card-bg: oklch(0.98 0.01 145);
                    --accent-color: var(--status-color, oklch(0.7 0.2 145));
                }

                .card {
                    background: var(--card-bg);
                    border-radius: 16px;
                    padding: 24px;
                    height: 100%;
                    box-sizing: border-box;
                    border: 1px solid oklch(0.9 0.02 145);
                    box-shadow: 
                        0 4px 6px -1px oklch(0 0 0 / 0.05),
                        0 2px 4px -2px oklch(0 0 0 / 0.05),
                        0 10px 15px -3px oklch(0 0 0 / 0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .card:hover {
                    transform: translateY(-4px);
                    box-shadow: 
                        0 20px 25px -5px oklch(0 0 0 / 0.1),
                        0 8px 10px -6px oklch(0 0 0 / 0.1);
                }

                .header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .icon {
                    font-size: 2rem;
                    background: oklch(1 0 0);
                    padding: 8px;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px oklch(0 0 0 / 0.05);
                }

                h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: var(--accent-color);
                }

                .description {
                    font-size: 1rem;
                    line-height: 1.6;
                    color: oklch(0.3 0.02 145);
                    flex-grow: 1;
                }

                .examples {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: oklch(0.5 0.02 145);
                    border-top: 1px solid oklch(0.9 0.02 145);
                    padding-top: 12px;
                    margin-top: 8px;
                }

                ::slotted(p) {
                    margin: 0;
                }
            </style>
            <div class="card ${status}">
                <div class="header">
                    <span class="icon">${icon}</span>
                    <h3>${title}</h3>
                </div>
                <div class="description">
                    <slot name="description"></slot>
                </div>
                <div class="examples">
                    <slot name="examples"></slot>
                </div>
            </div>
        `;
    }
}

customElements.define('difficulty-card', DifficultyCard);

// Real-time API Search Handling Logic
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('mountain-search');
    const feedback = document.getElementById('search-feedback');
    const resultContainer = document.getElementById('search-result');
    
    // Result elements
    const resName = document.getElementById('res-name');
    const resLoc = document.getElementById('res-loc');
    const resHeight = document.getElementById('res-height');
    const resInfo = document.getElementById('res-info');

    const showFeedback = (message, type = 'info') => {
        feedback.textContent = message;
        feedback.className = `feedback-message ${type}`;
        feedback.hidden = false;
        
        if (type === 'error') {
            resultContainer.hidden = true;
        }

        // Auto-hide feedback after a delay
        setTimeout(() => {
            feedback.hidden = true;
        }, 3000);
    };

    const searchMountain = async () => {
        const mountainName = searchInput.value.trim();
        
        if (!mountainName) {
            showFeedback('산 이름을 입력해 주세요!', 'error');
            return;
        }

        // Hide result section during new search
        resultContainer.hidden = true;
        showFeedback(`'${mountainName}' 정보를 실시간으로 분석 중입니다...`, 'success');

        // Use the Gemini-powered Search Endpoint
        const apiUrl = `/api/search?searchWrd=${encodeURIComponent(mountainName)}`;

        try {
            const response = await fetch(apiUrl);
            
            // Check content type to avoid "Unexpected token <" error
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Non-JSON response received:", text);
                throw new Error("서버에서 올바르지 않은 응답(HTML)을 받았습니다. API 키 설정을 확인해 주세요.");
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '데이터 로딩 실패');
            }

            const item = await response.json();
            console.log("Gemini API 응답 데이터:", item);

            if (item && item.mntnNm) {
                // Update UI using Gemini-generated fields
                // mntnNm: 산이름, mntnAdd: 위치, mntnHght: 높이, mntnInfo: 상세정보
                resName.innerText = item.mntnNm || mountainName;
                resLoc.innerText = item.mntnAdd || '위치 정보 없음';
                resHeight.innerText = (item.mntnHght || '0') + 'm';
                
                // Sanitize and display description
                let description = item.mntnInfo || '상세 정보가 준비 중입니다.';
                resInfo.innerText = description;

                resultContainer.hidden = false;
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                showFeedback(`'${mountainName}'의 정보를 생성할 수 없습니다. 다시 시도해 보세요.`, 'error');
            }
        } catch (error) {
            console.error('API Error details:', error);
            showFeedback(`오류 발생: ${error.message}`, 'error');
        }
    };

    searchBtn.addEventListener('click', searchMountain);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMountain();
        }
    });
});
