const TEST_MODE = true;
const sessionState = {
    loginCompleted: false,
    followCompleted: false,
    notifyCompleted: false,
    tweetCompleted: false,
    telegramCompleted: false,
    kycCompleted: false,
};

class CardCarousel {
    constructor() {
        this.cards = document.querySelectorAll('.card');
        this.currentIndex = 0;
        this.isAnimating = false;
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.init();
    }
    init() {
        this.updateCardPositions();
        this.prevBtn.addEventListener('click', () => this.previous());
        this.nextBtn.addEventListener('click', () => this.next());
        this.updateArrowVisibility();
    }
    updateCardPositions() {
        this.cards.forEach((card, index) => {
            card.classList.remove('active','prev','next','hidden','hidden-left');
            if (index === this.currentIndex) card.classList.add('active');
            else if (index === this.currentIndex - 1 || (this.currentIndex === 0 && index === this.cards.length - 1)) card.classList.add('prev');
            else if (index === this.currentIndex + 1 || (this.currentIndex === this.cards.length - 1 && index === 0)) card.classList.add('next');
            else if (index > this.currentIndex + 1) card.classList.add('hidden');
            else card.classList.add('hidden-left');
        });
        this.updateArrowVisibility();
    }
    updateArrowVisibility() {
        if (this.currentIndex === 0) this.prevBtn.style.display = 'none'; else this.prevBtn.style.display = 'flex';
        const isLast = this.currentIndex === this.cards.length - 1;
        if (isLast) { this.nextBtn.style.display = 'none'; return; }
        const currentCard = this.cards[this.currentIndex];
        let requiredKey = null;
        if (currentCard.classList.contains('login-card')) requiredKey = 'loginCompleted';
        else if (currentCard.classList.contains('follow-card')) requiredKey = 'followCompleted';
        else if (currentCard.classList.contains('notify-card')) requiredKey = 'notifyCompleted';
        else if (currentCard.classList.contains('tweet-card')) requiredKey = 'tweetCompleted';
        else if (currentCard.classList.contains('telegram-card')) requiredKey = 'telegramCompleted';
        else if (currentCard.classList.contains('kyc-card')) requiredKey = 'kycCompleted';
        const canProceed = requiredKey ? !!sessionState[requiredKey] : true;
        this.nextBtn.style.display = canProceed ? 'flex' : 'none';
    }
    next() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.cards.forEach(c => c.style.transition = 'all .6s cubic-bezier(0.4,0,0.2,1)');
        this.updateCardPositions();
        setTimeout(() => { this.cards.forEach(c => c.style.transition = ''); this.isAnimating = false; }, 600);
    }
    previous() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = this.currentIndex === 0 ? this.cards.length - 1 : this.currentIndex - 1;
        this.cards.forEach(c => c.style.transition = 'all .6s cubic-bezier(0.4,0,0.2,1)');
        this.updateCardPositions();
        setTimeout(() => { this.cards.forEach(c => c.style.transition = ''); this.isAnimating = false; }, 600);
    }
}

let carousel;

function showSuccess(cardSelector, storageKey) {
    const badge = document.querySelector(`${cardSelector} .success-badge`);
    if (badge) badge.classList.add('show');
    // Persist success for all tasks so badges survive refresh
    localStorage.setItem(storageKey, 'true');
    if (storageKey && storageKey in sessionState) {
        sessionState[storageKey] = true;
    }
    if (carousel) carousel.updateArrowVisibility();
}

function restoreStates() {
    if (TEST_MODE) return; // Testte kalıcılık yok
    const mapping = [
        { sel: '.login-card', key: 'loginCompleted' },
        { sel: '.follow-card', key: 'followCompleted' },
        { sel: '.tweet-card', key: 'tweetCompleted' },
        { sel: '.telegram-card', key: 'telegramCompleted' },
        { sel: '.kyc-card', key: 'kycCompleted' },
    ];
    mapping.forEach(m => { if (localStorage.getItem(m.key) === 'true') showSuccess(m.sel, m.key); });
}

document.addEventListener('DOMContentLoaded', () => {
    carousel = new CardCarousel();
    restoreStates();

    // Restore success badges (without unlocking navigation) for non-KYC cards
    (function restoreBadges() {
        const mapping = [
            { sel: '.login-card', key: 'loginCompleted' },
            { sel: '.follow-card', key: 'followCompleted' },
            { sel: '.notify-card', key: 'notifyCompleted' },
            { sel: '.tweet-card', key: 'tweetCompleted' },
            { sel: '.telegram-card', key: 'telegramCompleted' },
        ];
        mapping.forEach(m => {
            if (localStorage.getItem(m.key) === 'true') {
                const badge = document.querySelector(`${m.sel} .success-badge`);
                if (badge) badge.classList.add('show');
            }
        });
    })();

    // Simüle X ile giriş
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            showSuccess('.login-card', 'loginCompleted');
        });
    }

    // Sosyal görevler: kullanıcı dış bağlantıyı açtıktan sonra Done ile onaylıyor
    const followLink = document.getElementById('followLink');
    const followDone = document.getElementById('followDone');
    if (followDone) followDone.disabled = true;
    followLink?.addEventListener('click', () => {
        if (followDone) {
            followDone.disabled = true;
            setTimeout(() => { followDone.disabled = false; }, 4000);
        }
    });
    followDone?.addEventListener('click', () => showSuccess('.follow-card', 'followCompleted'));

    // Notifications task
    const notifyLink = document.getElementById('notifyLink');
    const notifyDone = document.getElementById('notifyDone');
    if (notifyDone) notifyDone.disabled = true;
    notifyLink?.addEventListener('click', () => {
        if (notifyDone) {
            notifyDone.disabled = true;
            setTimeout(() => { notifyDone.disabled = false; }, 4000);
        }
    });
    notifyDone?.addEventListener('click', () => showSuccess('.notify-card', 'notifyCompleted'));

    const tweetLink = document.getElementById('tweetLink');
    const tweetDone = document.getElementById('tweetDone');
    if (tweetDone) tweetDone.disabled = true;
    tweetLink?.addEventListener('click', () => {
        if (tweetDone) {
            tweetDone.disabled = true;
            setTimeout(() => { tweetDone.disabled = false; }, 4000);
        }
    });
    tweetDone?.addEventListener('click', () => showSuccess('.tweet-card', 'tweetCompleted'));

    const tgLink = document.getElementById('tgLink');
    const tgDone = document.getElementById('tgDone');
    if (tgDone) tgDone.disabled = true;
    tgLink?.addEventListener('click', () => {
        if (tgDone) {
            tgDone.disabled = true;
            setTimeout(() => { tgDone.disabled = false; }, 4000);
        }
    });
    tgDone?.addEventListener('click', () => showSuccess('.telegram-card', 'telegramCompleted'));

    // KYC & TX doğrulama
    const walletInput = document.querySelector('.wallet-input');
    const txInput = document.querySelector('.txhash-input');
    const verifyBtn = document.getElementById('verifyBtn');
    const loadingContainer = document.querySelector('.loading-container');
    const txnResult = document.querySelector('.txn-result');
    const kycDone = document.getElementById('kycDone');

    function validateInputs() {
        const addr = (walletInput?.value || '').trim();
        const tx = (txInput?.value || '').trim();
        const addrOk = addr.startsWith('0x') && addr.length === 42;
        const txOk = tx.startsWith('0x') && tx.length >= 66;
        if (verifyBtn) verifyBtn.disabled = !(addrOk && txOk);
    }

    walletInput?.addEventListener('input', validateInputs);
    txInput?.addEventListener('input', validateInputs);

    // KYC flow
    const kycNext = document.getElementById('kycNext');
    const kycStepIntro = document.querySelector('.kyc-step-intro');
    const kycLoading = document.querySelector('.kyc-loading');
    const kycVerify = document.querySelector('.kyc-verify');
    const kycDoneBtn = document.getElementById('kycDone');
    const kycCopy = document.getElementById('kycCopy');

    // Make KYC Next behave like other tasks: first click arms it, after 4s it becomes active; second click proceeds
    if (kycNext) {
        let kycNextReady = false;
        kycNext.addEventListener('click', () => {
            if (!kycNextReady) {
                kycNext.disabled = true;
                const originalText = kycNext.textContent;
                kycNext.textContent = 'Preparing...';
                setTimeout(() => {
                    kycNext.disabled = false;
                    kycNext.textContent = originalText || 'Next';
                    kycNextReady = true;
                }, 4000);
                return;
            }
            if (!kycStepIntro || !kycLoading || !kycVerify) return;
            kycStepIntro.style.display = 'none';
            kycLoading.style.display = 'flex';
            setTimeout(() => {
                kycLoading.style.display = 'none';
                kycVerify.style.display = 'flex';
            }, 2500);
        });
    }

    // Copy wallet address
    kycCopy?.addEventListener('click', () => {
        const addrEl = document.getElementById('kycWalletAddress');
        const text = addrEl?.textContent?.replace(/\u200B|<wbr>/g, '') || '';
        navigator.clipboard.writeText(text.replace(/\s+/g, ''));
        const original = kycCopy.textContent;
        kycCopy.textContent = 'Copied!';
        setTimeout(() => { kycCopy.textContent = original || 'Copy'; }, 1200);
    });

    // Enable Done only when TX hash length >= reference length
    const kycTxHash = document.getElementById('kycTxHash');
    const MIN_TX_LEN = '0xb3d92d1a743cd939e7ac337f763458356cde9f7ed1653fcf79f8e53178e4106f'.length; // 66
    if (kycDoneBtn) kycDoneBtn.disabled = true;
    kycTxHash?.addEventListener('input', () => {
        const val = (kycTxHash.value || '').trim();
        kycDoneBtn.disabled = val.length < MIN_TX_LEN;
    });

    // Restore KYC completion on refresh (lock UI)
    function restoreKycLock() {
        const completed = localStorage.getItem('kycCompleted') === 'true';
        if (!completed) return;
        const kycStepIntro = document.querySelector('.kyc-step-intro');
        const kycLoading = document.querySelector('.kyc-loading');
        const kycVerify = document.querySelector('.kyc-verify');
        if (kycStepIntro) kycStepIntro.style.display = 'none';
        if (kycLoading) kycLoading.style.display = 'none';
        if (kycVerify) kycVerify.style.display = 'flex';
        if (kycTxHash) {
            kycTxHash.setAttribute('readonly', 'readonly');
            kycTxHash.setAttribute('disabled', 'disabled');
        }
        if (kycDoneBtn) {
            kycDoneBtn.disabled = true;
            kycDoneBtn.style.opacity = '0.5';
            kycDoneBtn.style.cursor = 'not-allowed';
        }
        const badge = document.querySelector('.kyc-card .success-badge');
        if (badge) badge.classList.add('show');
    }

    restoreKycLock();

    kycDone?.addEventListener('click', () => {
        // Guard: require valid length
        const val = (kycTxHash?.value || '').trim();
        const ok = val.length >= MIN_TX_LEN;
        if (!ok) return;
        // Show center loader for 2.5s
        if (kycVerify && kycLoading) {
            kycVerify.style.display = 'none';
            kycLoading.style.display = 'flex';
            setTimeout(() => {
                kycLoading.style.display = 'none';
                kycVerify.style.display = 'flex';
                // Mark success and lock
                showSuccess('.kyc-card', 'kycCompleted');
                localStorage.setItem('kycCompleted', 'true');
                restoreKycLock();
            }, 2500);
        } else {
            // Fallback: mark success immediately
            showSuccess('.kyc-card', 'kycCompleted');
            localStorage.setItem('kycCompleted', 'true');
            restoreKycLock();
        }
    });
});


