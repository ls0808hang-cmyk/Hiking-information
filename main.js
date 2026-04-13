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

    const SERVICE_KEY = 'c6d38e7f40238d4d5ee29ef0a05b4f884d1d294a56c3e61a5dfc8f04a0f7b696';

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
        showFeedback(`'${mountainName}' 정보를 실시간으로 불러오는 중입니다...`, 'success');

        // Korea Forest Service API URL (Mountain Information)
        const apiUrl = `https://apis.data.go.kr/1400000/service/history/mountainInfo?serviceKey=${SERVICE_KEY}&mntnNm=${encodeURIComponent(mountainName)}&_type=json`;

        try {
            const response = await fetch(apiUrl);
            const textData = await response.text(); // Fetch as text first to check for specific service errors

            // Check for common API service errors (like key registration issues)
            if (textData.includes('SERVICE_KEY_IS_NOT_REGISTERED')) {
                showFeedback('인증키가 아직 활성화되지 않았습니다. 승인 후 최대 1~2시간이 소요될 수 있습니다.', 'error');
                return;
            }

            // Attempt to parse text as JSON
            const data = JSON.parse(textData);
            console.log("API 응답 데이터:", data);

            if (data.response && data.response.body && data.response.body.items && data.response.body.items.item) {
                // Take the first result (handle both single object and array cases)
                const item = Array.isArray(data.response.body.items.item) 
                    ? data.response.body.items.item[0] 
                    : data.response.body.items.item;

                // Update UI with sanitized real data
                resName.innerText = item.mntnNm || mountainName;
                resLoc.innerText = item.mntnadres || '정보 없음';
                resHeight.innerText = (item.mntnhght || '0') + 'm';
                
                // Sanitize description: remove HTML-like breaks and handle empty cases
                let description = item.mntninfdtl || '상세 정보가 준비 중입니다.';
                description = description.replace(/&lt;br&gt;/g, '\n').replace(/<br\s*\/?>/gi, '\n');
                resInfo.innerText = description;

                resultContainer.hidden = false;
                
                // Smooth scroll to result
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                showFeedback(`'${mountainName}'에 대한 검색 결과가 없습니다. '설악산'처럼 전체 이름을 입력해 보세요.`, 'error');
            }
        } catch (error) {
            console.error('API Error details:', error);
            showFeedback('데이터를 처리하는 중 문제가 발생했습니다. 키 활성화 상태를 확인하거나 잠시 후 다시 시도해 주세요.', 'error');
        }
    };

    searchBtn.addEventListener('click', searchMountain);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMountain();
        }
    });
});
