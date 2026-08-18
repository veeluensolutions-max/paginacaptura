/**
 * SCRIPT - EXCELÊNCIA AMBIENTAL (LANDING PAGE MODELAGEM ATMOSFÉRICA)
 * Gerenciamento do Mini-Diagnóstico, Abas de Setores, Formulário Multi-Step,
 * Barra Fixa Mobile, Acordeão FAQ, Efeitos de Scroll, Rastreamento UTM & Analytics
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CAPTURA AUTOMÁTICA DE PARÂMETROS UTM, GCLID, FBCLID & LI_FAT_ID
    const urlParams = new URLSearchParams(window.location.search);
    
    const utmFields = {
        'utm_source': urlParams.get('utm_source') || '',
        'utm_medium': urlParams.get('utm_medium') || '',
        'utm_campaign': urlParams.get('utm_campaign') || '',
        'utm_content': urlParams.get('utm_content') || '',
        'utm_term': urlParams.get('utm_term') || '',
        'gclid': urlParams.get('gclid') || '',
        'fbclid': urlParams.get('fbclid') || '',
        'li_fat_id': urlParams.get('li_fat_id') || '',
        'url_origem': document.referrer || window.location.href,
        'pagina_entrada': window.location.pathname
    };

    // Preenche campos ocultos do formulário
    Object.keys(utmFields).forEach(fieldId => {
        const inputEl = document.getElementById(fieldId);
        if (inputEl) {
            inputEl.value = utmFields[fieldId];
        }
    });

    // Disparo inicial do Analytics
    pushToDataLayer('page_view_modelagem', {
        page_url: window.location.href,
        referrer: utmFields.url_origem,
        utm_source: utmFields.utm_source,
        utm_campaign: utmFields.utm_campaign
    });

    // 2. HEADER INTELIGENTE NO SCROLL
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // 3. OBSERVER PARA ANIMAÇÃO DE SCROLL REVEAL (.fade-in)
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => scrollObserver.observe(el));

    // 4. MINI-DIAGNÓSTICO INTERATIVO (15 SEGUNDOS)
    const diagGroups = document.querySelectorAll('.diag-options-group');
    const diagResultTitle = document.getElementById('diag-result-title');
    const diagResultDesc = document.getElementById('diag-result-desc');
    const btnDiagApply = document.getElementById('btn-diag-apply');

    let currentDiag = {
        fase: 'Licenciamento ou EIA/RIMA',
        fonte: 'Sim, possui chaminés ativas',
        prazo: 'Urgente - até 15 dias'
    };

    diagGroups.forEach(group => {
        const groupKey = group.getAttribute('data-group');
        const buttons = group.querySelectorAll('.diag-pill-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDiag[groupKey] = btn.getAttribute('data-val');
                updateDiagFeedback();
            });
        });
    });

    function updateDiagFeedback() {
        if (currentDiag.fase.includes('EIA') || currentDiag.fase.includes('Notificação')) {
            diagResultTitle.textContent = 'Enquadramento Obrigatório Previsto pela Resolução CONAMA 513/2026';
            diagResultDesc.textContent = 'Empreendimentos em fase de EIA/RIMA ou notificação ambiental com fontes pontuais exigem o Estudo de Dispersão Atmosférica (EDA) para validação dos limites de emissão.';
        } else if (currentDiag.fonte.includes('Sim')) {
            diagResultTitle.textContent = 'Alta Recomendação Técnica para Avaliação Prévia';
            diagResultDesc.textContent = 'A presença de chaminés fixas ativas requer avaliação de pluma para evitar autuações e demonstrar conformidade com os novos padrões da CONAMA 506/2024.';
        } else {
            diagResultTitle.textContent = 'Avaliação Técnica de Fontes e Escopo';
            diagResultDesc.textContent = 'Nossa equipe verificará se suas fontes fugitivas ou processos necessitam de inventário de emissões ou modelagem preliminar.';
        }
    }

    // Clique no botão do diagnóstico preenche automaticamente o formulário
    btnDiagApply.addEventListener('click', () => {
        // Preenche campo necessidade
        const necessidadeSelect = document.getElementById('necessidade');
        if (currentDiag.fase.includes('Licenciamento')) necessidadeSelect.value = 'Licenciamento ambiental';
        else if (currentDiag.fase.includes('Renovação')) necessidadeSelect.value = 'Renovação de licença';
        else if (currentDiag.fase.includes('Ampliação')) necessidadeSelect.value = 'Ampliação da unidade';
        else if (currentDiag.fase.includes('Notificação')) necessidadeSelect.value = 'Exigência do órgão ambiental';

        // Preenche campo fonte
        const fonteSelect = document.getElementById('possui_fonte');
        if (currentDiag.fonte.includes('Sim')) fonteSelect.value = 'Sim';
        else if (currentDiag.fonte.includes('Não')) fonteSelect.value = 'Não';
        else fonteSelect.value = 'Não sei informar';

        // Preenche prazo
        const prazoSelect = document.getElementById('prazo');
        const temPrazoSelect = document.getElementById('tem_prazo');
        if (currentDiag.prazo.includes('Urgente')) {
            prazoSelect.value = 'Urgente - até 15 dias';
            temPrazoSelect.value = 'Sim';
        } else if (currentDiag.prazo.includes('15 a 30')) {
            prazoSelect.value = '15 a 30 dias';
            temPrazoSelect.value = 'Sim';
        } else {
            prazoSelect.value = 'Ainda não definido';
            temPrazoSelect.value = 'Não';
        }

        pushToDataLayer('use_mini_diagnostic', currentDiag);
    });

    // 5. ABAS INTERATIVAS DE SETORES INDUSTRIAIS
    const sectorTabs = document.querySelectorAll('.sector-tab-btn');
    const sectorContent = document.getElementById('sector-content');

    const sectorData = {
        'agro': {
            title: '🌾 Usinas Sucroenergéticas & Biomassa',
            desc: 'Modelagem de emissões de caldeiras a bagaço de cana, turbogeradores e dispersão de particulados finos e gases de combustão.',
            pollutants: ['Material Particulado (MP10 / MP2.5)', 'Monóxido de Carbono (CO)', 'Óxidos de Nitrogênio (NOx)', 'Dióxido de Enxofre (SO2)']
        },
        'metal': {
            title: '⚙️ Siderurgia, Metalurgia & Mineração',
            desc: 'Avaliação de fornos de redução, pelotização, sinterização, estocagem de minério e fontes fugitivas de poeira.',
            pollutants: ['MP Total e Frações Respiráveis', 'Metais Pesados (Pb, Cd, As)', 'SO2 e SO3', 'Gases de Alto-Forno']
        },
        'quimica': {
            title: '🧪 Indústrias Químicas, Petroquímicas & Fertilizantes',
            desc: 'Simulação de reatores, colunas de destilação, dispersão de compostos voláteis e estudos olfatométricos de odor.',
            pollutants: ['Compostos Orgânicos Voláteis (VOCs)', 'Amônia (NH3)', 'Gases Ácidos (HCl, HF)', 'Vapores Orgânicos']
        },
        'energia': {
            title: '⚡ Termelétricas, Grupos Geradores & Energia',
            desc: 'Modelagem de dispersão térmica de chaminés de turbinas a gás, motores a óleo e atendimento estrito à CONAMA 506.',
            pollutants: ['NOx e NO2', 'SO2', 'Ozônio Troposférico (O3 secundário)', 'Particulados']
        },
        'cimento': {
            title: '🧱 Cimenteiras, Cerâmicas & Minerais Não-Metálicos',
            desc: 'Avaliação de fornos rotativos de clínquer, moinhos, secadores e fontes fugitivas em áreas de britagem.',
            pollutants: ['Poeira Total / Particulados', 'NOx térmico', 'SO2', 'Fluoretos e Cloretos']
        },
        'alimentos': {
            title: '🥩 Indústrias Alimentícias & Frigoríficos',
            desc: 'Estudos de caldeiras a biomassa/lenha, digestores e dispersão de odores em áreas rurais e de expansão urbana.',
            pollutants: ['Odor e Gases Sulfurados (H2S)', 'Material Particulado', 'CO e NOx']
        }
    };

    function renderSectorTab(key) {
        const item = sectorData[key] || sectorData['agro'];
        sectorContent.innerHTML = `
            <div class="sector-detail-card">
                <div class="sector-detail-header">
                    <h3>${item.title}</h3>
                </div>
                <p style="color: #475569; font-size: 1rem;">${item.desc}</p>
                <div>
                    <strong style="font-size: 0.85rem; color: #1E293B; text-transform: uppercase; letter-spacing: 0.05em;">Principais Poluentes Modelados:</strong>
                    <div class="pollutants-pill-list">
                        ${item.pollutants.map(p => `<span class="pollutant-badge">${p}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    sectorTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            sectorTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const key = tab.getAttribute('data-tab');
            renderSectorTab(key);
            pushToDataLayer('view_sector_tab', { sector: key });
        });
    });

    // Render inicial da primeira aba
    renderSectorTab('agro');

    // 6. FORMULÁRIO MULTI-STEP (2 ETAPAS) & MÁSCARA INTELIGENTE
    const btnNextStep = document.getElementById('btn-next-step');
    const btnPrevStep = document.getElementById('btn-prev-step');
    const stepPanel1 = document.getElementById('step-panel-1');
    const stepPanel2 = document.getElementById('step-panel-2');
    const stepNav1 = document.getElementById('step-nav-1');
    const stepNav2 = document.getElementById('step-nav-2');
    const leadForm = document.getElementById('lead-form');
    const formAlert = document.getElementById('form-msg');
    const submitBtn = document.getElementById('btn-submit-form');
    const phoneInput = document.getElementById('whatsapp');

    // Máscara dinâmica de telefone/WhatsApp: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 11) val = val.substring(0, 11);

            if (val.length > 10) {
                // Celular com 9 dígitos: (11) 98765-4321
                e.target.value = `(${val.substring(0,2)}) ${val.substring(2,7)}-${val.substring(7,11)}`;
            } else if (val.length > 6) {
                // Fixo ou celular digitando: (11) 8765-4321
                e.target.value = `(${val.substring(0,2)}) ${val.substring(2,6)}-${val.substring(6,10)}`;
            } else if (val.length > 2) {
                e.target.value = `(${val.substring(0,2)}) ${val.substring(2)}`;
            } else if (val.length > 0) {
                e.target.value = `(${val}`;
            } else {
                e.target.value = '';
            }
        });
    }

    // Avança para Etapa 2
    btnNextStep.addEventListener('click', () => {
        // Validação da Etapa 1
        const segmento = document.getElementById('segmento');
        const necessidade = document.getElementById('necessidade');
        const possuiFonte = document.getElementById('possui_fonte');
        const temPrazo = document.getElementById('tem_prazo');
        const prazo = document.getElementById('prazo');

        if (!segmento.value.trim()) {
            segmento.focus();
            return;
        }
        if (!necessidade.value) {
            necessidade.focus();
            return;
        }
        if (!possuiFonte.value) {
            possuiFonte.focus();
            return;
        }
        if (!temPrazo.value) {
            temPrazo.focus();
            return;
        }
        if (!prazo.value) {
            prazo.focus();
            return;
        }

        stepPanel1.classList.remove('active');
        stepPanel2.classList.add('active');
        stepNav2.classList.add('active');

        pushToDataLayer('form_step_2_reached', {
            segmento: segmento.value,
            necessidade: necessidade.value
        });
    });

    // Volta para Etapa 1
    btnPrevStep.addEventListener('click', () => {
        stepPanel2.classList.remove('active');
        stepPanel1.classList.add('active');
        stepNav2.classList.remove('active');
    });

    // Rastreia primeiro foco no formulário
    let formStarted = false;
    leadForm.addEventListener('focusin', () => {
        if (!formStarted) {
            pushToDataLayer('start_form', { form_id: 'lead-form' });
            formStarted = true;
        }
    }, { once: true });

    // Envio do formulário com integração e fallback
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Coleta de todos os dados preenchidos
        const formData = new FormData(leadForm);
        const dataPayload = Object.fromEntries(formData.entries());

        // Cria o registro completo do Lead
        const newLead = {
            id: 'LEAD-' + Date.now(),
            data_envio: new Date().toLocaleString('pt-BR'),
            timestamp: Date.now(),
            status: 'Novo',
            nome: dataPayload.nome || '',
            empresa: dataPayload.empresa || '',
            cargo: dataPayload.cargo || '',
            segmento: dataPayload.segmento || '',
            email: dataPayload.email || '',
            whatsapp: dataPayload.whatsapp || '',
            cidade: dataPayload.cidade || '',
            estado: dataPayload.estado || '',
            possui_fonte: dataPayload.possui_fonte || '',
            necessidade: dataPayload.necessidade || '',
            tem_prazo: dataPayload.tem_prazo || '',
            prazo: dataPayload.prazo || '',
            mensagem: dataPayload.mensagem || '',
            utm_source: dataPayload.utm_source || 'Direto / Orgânico',
            utm_medium: dataPayload.utm_medium || '',
            utm_campaign: dataPayload.utm_campaign || '',
            utm_content: dataPayload.utm_content || '',
            utm_term: dataPayload.utm_term || '',
            gclid: dataPayload.gclid || '',
            url_origem: dataPayload.url_origem || ''
        };

        // Salva no Supabase (Banco de Dados em Nuvem via API REST Direta)
        try {
            const supabaseResp = await fetch('https://qqvrgxhemzsgjbradlqv.supabase.co/rest/v1/leads', {
                method: 'POST',
                headers: {
                    'apikey': 'sb_publishable_IxdmYD6DJ_GMfxGbP2rOnw_3wP9u-_c',
                    'Authorization': 'Bearer sb_publishable_IxdmYD6DJ_GMfxGbP2rOnw_3wP9u-_c',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    id: newLead.id,
                    data_envio: newLead.data_envio,
                    status: newLead.status,
                    nome: newLead.nome,
                    empresa: newLead.empresa,
                    cargo: newLead.cargo,
                    segmento: newLead.segmento,
                    email: newLead.email,
                    whatsapp: newLead.whatsapp,
                    cidade: newLead.cidade,
                    estado: newLead.estado,
                    possui_fonte: newLead.possui_fonte,
                    necessidade: newLead.necessidade,
                    tem_prazo: newLead.tem_prazo,
                    prazo: newLead.prazo,
                    mensagem: newLead.mensagem,
                    utm_source: newLead.utm_source,
                    utm_medium: newLead.utm_medium,
                    utm_campaign: newLead.utm_campaign,
                    utm_content: newLead.utm_content,
                    utm_term: newLead.utm_term,
                    gclid: newLead.gclid,
                    url_origem: newLead.url_origem
                })
            });

            if (supabaseResp.ok) {
                console.log('[Supabase] Lead gravado com sucesso no banco de dados!');
            } else {
                const errText = await supabaseResp.text();
                console.warn('[Supabase] Resposta da API:', errText);
            }
        } catch (err) {
            console.error('[Supabase] Erro ao enviar para o banco:', err);
        }

        // Salva no localStorage como backup de segurança
        try {
            const existingLeads = JSON.parse(localStorage.getItem('excelencia_leads') || '[]');
            existingLeads.unshift(newLead);
            localStorage.setItem('excelencia_leads', JSON.stringify(existingLeads));
        } catch (err) {
            console.error('Erro ao armazenar lead localmente:', err);
        }

        // Envio opcional via Webhook externo se configurado
        if (window.EXCELENCIA_WEBHOOK_URL) {
            try {
                fetch(window.EXCELENCIA_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newLead),
                    mode: 'no-cors'
                }).catch(e => console.log('Webhook info:', e));
            } catch (e) {
                console.warn('Webhook dispatch skipped:', e);
            }
        }

        // Disparo de submit no analytics
        pushToDataLayer('form_submit', {
            nome: newLead.nome,
            empresa: newLead.empresa,
            segmento: newLead.segmento,
            estado: newLead.estado,
            necessidade: newLead.necessidade
        });

        // Estado visual de carregamento
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <span>Enviando solicitação...</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        `;
        submitBtn.disabled = true;

        setTimeout(() => {
            const cleanPhone = (newLead.whatsapp || '').replace(/\D/g, '');
            const waRedirect = `https://wa.me/5581997620079?text=Ol%C3%A1%2C+acabei+de+enviar+meus+dados+no+site+para+avalia%C3%A7%C3%A3o+de+Modelagem+Atmosf%C3%A9rica.+Meu+nome+%C3%A9+${encodeURIComponent(newLead.nome)}+da+empresa+${encodeURIComponent(newLead.empresa)}.`;

            formAlert.className = 'form-alert-box success';
            formAlert.innerHTML = `
                <strong>Solicitação recebida com sucesso!</strong><br>
                Nossa equipe técnica analisará as características da sua empresa e entrará em contato em breve.<br>
                <a href="${waRedirect}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 10px; font-weight: 700; color: #065F46; text-decoration: underline;">
                    Deseja agilizar? Clique aqui para falar diretamente pelo WhatsApp →
                </a>
            `;
            
            leadForm.reset();
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;

            // Retorna para a etapa 1 limpa
            stepPanel2.classList.remove('active');
            stepPanel1.classList.add('active');
            stepNav2.classList.remove('active');

            // Scroll suave até o alerta de confirmação
            formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Disparo de conversão
            pushToDataLayer('form_success', {
                event_action: 'lead_conversion_complete',
                lead_id: newLead.id
            });

        }, 800);
    });

    // 7. ACORDEÃO INTERATIVO DO FAQ
    const faqCards = document.querySelectorAll('.faq-card');

    faqCards.forEach(card => {
        const toggleBtn = card.querySelector('.faq-toggle');
        const bodyEl = card.querySelector('.faq-body');

        toggleBtn.addEventListener('click', () => {
            const isCurrentlyActive = card.classList.contains('active');

            // Fecha outros abertos
            faqCards.forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('active')) {
                    otherCard.classList.remove('active');
                    const otherBtn = otherCard.querySelector('.faq-toggle');
                    const otherBody = otherCard.querySelector('.faq-body');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherBody) otherBody.style.maxHeight = null;
                }
            });

            // Alterna o atual
            if (!isCurrentlyActive) {
                card.classList.add('active');
                toggleBtn.setAttribute('aria-expanded', 'true');
                bodyEl.style.maxHeight = bodyEl.scrollHeight + "px";

                const questionText = toggleBtn.querySelector('span:first-child')?.textContent || '';
                pushToDataLayer('view_faq', { question: questionText.trim() });
            } else {
                card.classList.remove('active');
                toggleBtn.setAttribute('aria-expanded', 'false');
                bodyEl.style.maxHeight = null;
            }
        });
    });

    // 8. BARRA FIXA MOBILE (EXIBIÇÃO INTELIGENTE NO SCROLL)
    const mobileBottomBar = document.getElementById('mobile-bottom-bar');
    const contactSection = document.getElementById('contato');

    if (mobileBottomBar && contactSection) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = 450;
            const contactTop = contactSection.getBoundingClientRect().top + window.scrollY;

            // Mostra após passar do Hero e esconde quando o formulário estiver na tela
            if (scrollY > heroHeight && scrollY < contactTop - 300) {
                mobileBottomBar.classList.add('active');
            } else {
                mobileBottomBar.classList.remove('active');
            }
        }, { passive: true });
    }

    // 9. RASTREAMENTO DE CLIQUES EM CTAS E WHATSAPP
    const trackClick = (elementId, eventName, eventData) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.addEventListener('click', () => {
                pushToDataLayer(eventName, eventData);
            });
        }
    };

    trackClick('btn-header-cta', 'click_header_cta', { location: 'header' });
    trackClick('btn-hero-solicitar', 'click_cta_hero', { location: 'hero_primary' });
    trackClick('btn-hero-whatsapp', 'click_whatsapp', { location: 'hero_whatsapp' });
    trackClick('btn-whatsapp-float', 'click_whatsapp', { location: 'float_button' });
    trackClick('btn-mobile-diag', 'click_mobile_bar_diag', { location: 'mobile_bar' });
    trackClick('btn-mobile-wa', 'click_mobile_bar_wa', { location: 'mobile_bar' });

    // Função Central do Google Tag Manager / DataLayer
    function pushToDataLayer(eventName, params = {}) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: eventName,
            timestamp: new Date().toISOString(),
            ...params
        });
        console.log(`[DataLayer] ${eventName}:`, params);
    }
});

