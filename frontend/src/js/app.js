// =========================================================
// ACCÈS DESKTOP UNIQUEMENT
// Les pages de l'app sont bloquées sur petit écran.
// La page de paiement client reste accessible sur mobile.
// =========================================================
const paymentLinkPage = document.querySelector('.payment-link-page');

function renderDesktopAccessNotice() {
	if (paymentLinkPage) return;

	const shouldBlock = window.innerWidth < 992;
	let blocker = document.getElementById('desktop-access-blocker');
	const isLoginPage = document.body.classList.contains('auth-page');
	const authLayout = isLoginPage ? document.querySelector('.auth-layout') : null;

	if (shouldBlock) {
		if (authLayout) {
			const authCard = authLayout.querySelector('.auth-card');
			const existingTemplate = authLayout.querySelector('#login-card-template');
			if (authCard && !existingTemplate) {
				const template = document.createElement('template');
				template.id = 'login-card-template';
				template.innerHTML = authCard.outerHTML;
				authLayout.appendChild(template);
				authCard.remove();
			}
		}

		if (!blocker) {
			blocker = document.createElement('div');
			blocker.id = 'desktop-access-blocker';
			blocker.className = 'desktop-access-blocker';
			blocker.innerHTML = `
				<div class="desktop-access-card" role="alert" aria-live="assertive">
					<div class="desktop-access-icon">💻</div>
					<h2>Accès sur ordinateur requis</h2>
					<p>Cette application ONG est conçue pour être ouverte depuis un ordinateur.</p>
					<p class="subtitle">Veuillez vous connecter sur ordinateur pour accéder à l'espace sécurisé.</p>
				</div>
			`;
			document.body.insertBefore(blocker, document.body.firstChild);
		}
		document.body.classList.add('desktop-locked');
	} else {
		if (authLayout) {
			const authCard = authLayout.querySelector('.auth-card');
			const template = authLayout.querySelector('#login-card-template');
			if (!authCard && template) {
				authLayout.insertAdjacentHTML('afterbegin', template.innerHTML);
				template.remove();
				bindLoginFormHandler();
			}
		}

		document.body.classList.remove('desktop-locked');
		if (blocker) blocker.remove();
	}
}

renderDesktopAccessNotice();
window.addEventListener('resize', renderDesktopAccessNotice);

const AUTOMATION_STORAGE_KEYS = {
	rules: 'ongAutomationRules',
	logs: 'ongAutomationLogs'
};

const DEFAULT_AUTOMATION_RULES = [
	{
		id: 'payment-to-excel',
		label: 'Lorsqu’un paiement est validé : ajouter une ligne dans Excel',
		description: 'Synchronise les paiements vers un tableau de suivi exportable.',
		active: true
	},
	{
		id: 'upload-document-store',
		label: 'Lorsqu’un fichier est uploadé : enregistrer dans la base documentaire',
		description: 'Prépare le stockage documentaire et la classification future.',
		active: true
	},
	{
		id: 'user-to-list',
		label: 'Lorsqu’un utilisateur s’inscrit : ajouter dans fichier utilisateurs',
		description: 'Simule l’alimentation du référentiel utilisateurs.',
		active: false
	}
];

const DEFAULT_AUTOMATION_LOGS = [
	{ type: 'export effectué', user: 'Marie Tchana', dateTime: '2026-05-18T08:30:00', status: 'succès' },
	{ type: 'paiement enregistré', user: 'Jonas Ebong', dateTime: '2026-05-17T15:45:00', status: 'succès' },
	{ type: 'fichier ajouté', user: 'Aline Nkomo', dateTime: '2026-05-17T10:20:00', status: 'succès' }
];

function safeReadJSON(key, fallback) {
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch (error) {
		return fallback;
	}
}

function safeWriteJSON(key, value) {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		// Pas de stockage persistant disponible: on reste en simulation.
	}
}

function seedAutomationStorage() {
	if (!safeReadJSON(AUTOMATION_STORAGE_KEYS.rules, null)) {
		safeWriteJSON(AUTOMATION_STORAGE_KEYS.rules, DEFAULT_AUTOMATION_RULES);
	}

	if (!safeReadJSON(AUTOMATION_STORAGE_KEYS.logs, null)) {
		safeWriteJSON(AUTOMATION_STORAGE_KEYS.logs, DEFAULT_AUTOMATION_LOGS);
	}
}

function getAutomationRules() {
	return safeReadJSON(AUTOMATION_STORAGE_KEYS.rules, DEFAULT_AUTOMATION_RULES);
}

function setAutomationRules(rules) {
	safeWriteJSON(AUTOMATION_STORAGE_KEYS.rules, rules);
}

function getAutomationLogs() {
	return safeReadJSON(AUTOMATION_STORAGE_KEYS.logs, DEFAULT_AUTOMATION_LOGS);
}

function setAutomationLogs(logs) {
	safeWriteJSON(AUTOMATION_STORAGE_KEYS.logs, logs.slice(0, 50));
}

function addAutomationLog(entry) {
	const logs = getAutomationLogs();
	logs.unshift({
		id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
		type: entry.type,
		user: entry.user || 'Système',
		dateTime: entry.dateTime || new Date().toISOString(),
		status: entry.status || 'succès'
	});
	setAutomationLogs(logs);
}

function formatLocalDateTime(isoDateTime) {
	const date = new Date(isoDateTime);
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

function getAutomationSamplePayments() {
	return [
		{ name: 'Aline Nkomo', email: 'aline@ong.org', amount: 150, date: '2026-05-17', status: 'payé', purpose: 'Achat plants forestiers' },
		{ name: 'Jonas Ebong', email: 'jonas@ong.org', amount: 80, date: '2026-05-16', status: 'en attente', purpose: 'Transport matériel' },
		{ name: 'David Meka', email: 'david@ong.org', amount: 120, date: '2026-05-15', status: 'échoué', purpose: 'Formation terrain' }
	];
}

function getAutomationSampleFiles() {
	return [
		{ name: 'Plan_reboisement_Q2.pdf', category: 'Reboisement', author: 'Marie Tchana', date: '2026-05-17' },
		{ name: 'Rapport_terrain_Sud.xlsx', category: 'Terrain', author: 'Jonas Ebong', date: '2026-05-16' },
		{ name: 'Convention_partenaire.docx', category: 'Administratif', author: 'Aline Nkomo', date: '2026-05-15' }
	];
}

seedAutomationStorage();

function bindLoginFormHandler() {
	const loginForm = document.getElementById('login-form');
	if (!loginForm || loginForm.dataset.bound === '1') return;
	loginForm.dataset.bound = '1';

	// =========================================================
	// PAGE 1 - CONNEXION
	// Validation simulée puis redirection vers le dashboard.
	// =========================================================
	loginForm.addEventListener('submit', (event) => {
		event.preventDefault();

		const emailInput = document.getElementById('email');
		const passwordInput = document.getElementById('password');
		const message = document.getElementById('form-message');

		const email = emailInput.value.trim();
		const password = passwordInput.value.trim();
		const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

		if (!email || !password) {
			message.textContent = 'Veuillez remplir tous les champs.';
			return;
		}

		if (!emailIsValid) {
			message.textContent = 'Veuillez saisir un email valide.';
			return;
		}

		message.style.color = '#1f5c3f';
		message.textContent = 'Connexion réussie. Redirection...';

		setTimeout(() => {
			window.location.href = './dashboard.html';
		}, 650);
	});
}

bindLoginFormHandler();

const dashboardBody = document.querySelector('.dashboard-page');

if (dashboardBody) {
	// =========================================================
	// PAGE 2 - DASHBOARD
	// Injection de statistiques et activités récentes (mock data).
	// =========================================================
	const mockStats = {
		files: 148,
		users: 23,
		payments: 41,
		storage: '12.4 Go'
	};

	const mockRecentFiles = [
		{ name: 'Plan_reboisement_Q2.pdf', date: '17/05/2026' },
		{ name: 'Rapport_terrain_Sud.xlsx', date: '16/05/2026' },
		{ name: 'Inventaire_semences.docx', date: '15/05/2026' },
		{ name: 'Carte_zone_projet.png', date: '14/05/2026' }
	];

	const mockRecentPayments = [
		{ label: 'Achat plants forestiers', amount: '€ 320', date: '17/05/2026' },
		{ label: 'Transport matériel', amount: '€ 145', date: '16/05/2026' },
		{ label: 'Fournitures pépinière', amount: '€ 88', date: '14/05/2026' },
		{ label: 'Formation communauté', amount: '€ 210', date: '13/05/2026' }
	];

	const statFiles = document.getElementById('stat-files');
	const statUsers = document.getElementById('stat-users');
	const statPayments = document.getElementById('stat-payments');
	const statStorage = document.getElementById('stat-storage');

	if (statFiles) statFiles.textContent = String(mockStats.files);
	if (statUsers) statUsers.textContent = String(mockStats.users);
	if (statPayments) statPayments.textContent = String(mockStats.payments);
	if (statStorage) statStorage.textContent = mockStats.storage;

	const recentFilesList = document.getElementById('recent-files');
	const recentPaymentsList = document.getElementById('recent-payments');

	if (recentFilesList) {
		recentFilesList.innerHTML = mockRecentFiles
			.map((item) => `<li><span>${item.name}</span><span>${item.date}</span></li>`)
			.join('');
	}

	if (recentPaymentsList) {
		recentPaymentsList.innerHTML = mockRecentPayments
			.map((item) => `<li><span>${item.label} (${item.amount})</span><span>${item.date}</span></li>`)
			.join('');
	}
}

const libraryPage = document.querySelector('.library-page');

if (libraryPage) {
	// =========================================================
	// PAGE 4 - BIBLIOTHÈQUE
	// Recherche + filtres + actions simulées sur les documents.
	// =========================================================
	const mockLibraryFiles = [
		{ name: 'Plan_reboisement_Q2.pdf', category: 'Reboisement', author: 'Marie Tchana', date: '2026-05-17' },
		{ name: 'Rapport_terrain_Sud.xlsx', category: 'Terrain', author: 'Jonas Ebong', date: '2026-05-16' },
		{ name: 'Convention_partenaire.docx', category: 'Administratif', author: 'Aline Nkomo', date: '2026-05-15' },
		{ name: 'Carte_zone_projet.png', category: 'Cartographie', author: 'Marie Tchana', date: '2026-05-14' },
		{ name: 'Suivi_pépinière_mai.pdf', category: 'Pépinière', author: 'David Meka', date: '2026-05-12' },
		{ name: 'Budget_mensuel_forets.xlsx', category: 'Financier', author: 'Aline Nkomo', date: '2026-05-11' }
	];

	const searchInput = document.getElementById('search-file');
	const categoryFilter = document.getElementById('filter-category');
	const dateFilter = document.getElementById('filter-date');
	const userFilter = document.getElementById('filter-user');
	const tableBody = document.getElementById('library-table-body');
	const countLabel = document.getElementById('library-count');
	const actionMessage = document.getElementById('library-action-message');

	const categories = [...new Set(mockLibraryFiles.map((item) => item.category))].sort();
	const users = [...new Set(mockLibraryFiles.map((item) => item.author))].sort();

	if (categoryFilter) {
		categoryFilter.innerHTML = '<option value="all">Toutes</option>' + categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('');
	}

	if (userFilter) {
		userFilter.innerHTML = '<option value="all">Tous</option>' + users.map((user) => `<option value="${user}">${user}</option>`).join('');
	}

	function formatDate(isoDate) {
		// Transforme YYYY-MM-DD en DD/MM/YYYY pour l'affichage.
		const [year, month, day] = isoDate.split('-');
		return `${day}/${month}/${year}`;
	}

	function renderRows(rows) {
		// Rend les lignes filtrées dans le tableau bibliothèque.
		if (!tableBody) return;

		if (!rows.length) {
			tableBody.innerHTML = '<tr><td class="table-empty" colspan="5">Aucun document trouvé.</td></tr>';
			if (countLabel) countLabel.textContent = '0 fichier affiché.';
			return;
		}

		tableBody.innerHTML = rows
			.map(
				(item) =>
					`<tr>
						<td>${item.name}</td>
						<td>${item.category}</td>
						<td>${item.author}</td>
						<td>${formatDate(item.date)}</td>
						<td>
							<div class="table-actions">
								<button class="table-btn" data-action="voir" data-file="${item.name}">Voir</button>
								<button class="table-btn" data-action="telecharger" data-file="${item.name}">Télécharger</button>
								<button class="table-btn" data-action="supprimer" data-file="${item.name}">Supprimer</button>
							</div>
						</td>
					</tr>`
			)
			.join('');

		if (countLabel) {
			countLabel.textContent = `${rows.length} fichier${rows.length > 1 ? 's' : ''} affiché${rows.length > 1 ? 's' : ''}.`;
		}
	}

	function applyFilters() {
		// Filtrage combiné: texte + catégorie + date + auteur.
		const q = (searchInput?.value || '').trim().toLowerCase();
		const selectedCategory = categoryFilter?.value || 'all';
		const selectedDate = dateFilter?.value || '';
		const selectedUser = userFilter?.value || 'all';

		const filtered = mockLibraryFiles.filter((item) => {
			const queryText = `${item.name} ${item.category} ${item.author} ${item.date}`.toLowerCase();
			const matchSearch = !q || queryText.includes(q);
			const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
			const matchDate = !selectedDate || item.date === selectedDate;
			const matchUser = selectedUser === 'all' || item.author === selectedUser;
			return matchSearch && matchCategory && matchDate && matchUser;
		});

		renderRows(filtered);
	}

	[searchInput, categoryFilter, dateFilter, userFilter].forEach((el) => {
		if (el) {
			el.addEventListener('input', applyFilters);
			el.addEventListener('change', applyFilters);
		}
	});

	if (tableBody) {
		tableBody.addEventListener('click', (event) => {
			const btn = event.target.closest('button[data-action]');
			if (!btn || !actionMessage) return;
			const action = btn.dataset.action;
			const fileName = btn.dataset.file;
			actionMessage.style.color = '#1f5c3f';
			actionMessage.textContent = `Action simulée: ${action} sur "${fileName}".`;
		});
	}

	applyFilters();
}

const paymentsPage = document.querySelector('.payments-page');

if (paymentsPage) {
	// =========================================================
	// PAGE 5 - PAIEMENTS (BACK-OFFICE)
	// Création de liens, consultation et filtrage des paiements.
	// =========================================================
	const historyBody = document.getElementById('payments-history-body');
	const countLabel = document.getElementById('payments-count');
	const actionMessage = document.getElementById('payments-action-message');
	const linkPurpose = document.getElementById('link-purpose');
	const linkAmount = document.getElementById('link-amount');
	const generateLinkBtn = document.getElementById('generate-link-btn');
	const paymentLinkOutput = document.getElementById('payment-link-output');
	const openPaymentLink = document.getElementById('open-payment-link');
	const paymentLinkMessage = document.getElementById('payment-link-message');
	const searchPayment = document.getElementById('search-payment');
	const filterPaymentStatus = document.getElementById('filter-payment-status');
	const filterPaymentDate = document.getElementById('filter-payment-date');
	const filterPaymentUser = document.getElementById('filter-payment-user');

	const paymentHistory = [
		{
			name: 'Aline Nkomo',
			email: 'aline@ong.org',
			purpose: 'Achat plants forestiers',
			amount: 150,
			date: '2026-05-17',
			status: 'payé',
			link: './paiement-lien.html?amount=150.00&objet=Achat%20plants%20forestiers&ref=PAY-20260517-001'
		},
		{
			name: 'Jonas Ebong',
			email: 'jonas@ong.org',
			purpose: 'Transport matériel',
			amount: 80,
			date: '2026-05-16',
			status: 'en attente',
			link: './paiement-lien.html?amount=80.00&objet=Transport%20mat%C3%A9riel&ref=PAY-20260516-003'
		},
		{
			name: 'David Meka',
			email: 'david@ong.org',
			purpose: 'Formation terrain',
			amount: 120,
			date: '2026-05-15',
			status: 'échoué',
			link: './paiement-lien.html?amount=120.00&objet=Formation%20terrain&ref=PAY-20260515-008'
		}
	];

	const statusClassMap = {
		payé: 'status-paid',
		'en attente': 'status-pending',
		échoué: 'status-failed'
	};

	function formatAmount(value) {
		// Uniformise l'affichage des montants en euro.
		return `€ ${Number(value).toFixed(2)}`;
	}

	function formatDate(isoDate) {
		const [year, month, day] = isoDate.split('-');
		return `${day}/${month}/${year}`;
	}

	function buildUserFilterOptions() {
		// Construit dynamiquement les utilisateurs disponibles dans le filtre.
		if (!filterPaymentUser) return;
		const users = [...new Set(paymentHistory.map((item) => item.name))].sort();
		filterPaymentUser.innerHTML = '<option value="all">Tous</option>' + users.map((user) => `<option value="${user}">${user}</option>`).join('');
	}

	function renderPaymentHistory(rows) {
		// Rend la table des paiements selon les résultats filtrés.
		if (!historyBody) return;
		if (!rows.length) {
			historyBody.innerHTML = '<tr><td class="table-empty" colspan="7">Aucun paiement trouvé.</td></tr>';
			if (countLabel) countLabel.textContent = '0 paiement affiché.';
			return;
		}

		historyBody.innerHTML = rows
			.map((item) => {
				const statusClass = statusClassMap[item.status] || 'status-pending';
				const linkCell = item.link
					? `<a class="table-btn" href="${item.link}" target="_blank" rel="noopener">Ouvrir</a>`
					: '-';
				return `<tr>
					<td>${item.name}</td>
					<td>${item.email}</td>
					<td>${item.purpose}</td>
					<td>${formatAmount(item.amount)}</td>
					<td>${formatDate(item.date)}</td>
					<td><span class="status-pill ${statusClass}">${item.status}</span></td>
					<td>${linkCell}</td>
				</tr>`;
			})
			.join('');

		if (countLabel) {
			countLabel.textContent = `${rows.length} paiement${rows.length > 1 ? 's' : ''} affiché${rows.length > 1 ? 's' : ''}.`;
		}
	}

	function applyPaymentFilters() {
		// Filtrage combiné type bibliothèque (texte + statut + date + utilisateur).
		const q = (searchPayment?.value || '').trim().toLowerCase();
		const selectedStatus = filterPaymentStatus?.value || 'all';
		const selectedDate = filterPaymentDate?.value || '';
		const selectedUser = filterPaymentUser?.value || 'all';

		const filtered = paymentHistory.filter((item) => {
			const matchQuery = !q || `${item.name} ${item.email} ${item.purpose}`.toLowerCase().includes(q);
			const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
			const matchDate = !selectedDate || item.date === selectedDate;
			const matchUser = selectedUser === 'all' || item.name === selectedUser;
			return matchQuery && matchStatus && matchDate && matchUser;
		});

		renderPaymentHistory(filtered);
	}

	if (generateLinkBtn) {
		generateLinkBtn.addEventListener('click', () => {
			const purpose = linkPurpose?.value.trim() || 'Paiement ONG Foresterie';
			const amountValue = linkAmount?.value.trim() || '';
			const amount = Number(amountValue);

			if (!amountValue || !Number.isFinite(amount) || amount <= 0) {
				if (paymentLinkMessage) {
					paymentLinkMessage.style.color = '#b02a37';
					paymentLinkMessage.textContent = 'Veuillez saisir un prix valide supérieur à 0.';
				}
				return;
			}

			const reference = `PAY-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(Math.floor(Math.random() * 900) + 100)}`;
			const linkUrl = `./paiement-lien.html?amount=${encodeURIComponent(amount.toFixed(2))}&objet=${encodeURIComponent(purpose)}&ref=${encodeURIComponent(reference)}`;

			if (paymentLinkOutput) {
				paymentLinkOutput.value = linkUrl;
			}

			if (openPaymentLink) {
				openPaymentLink.href = linkUrl;
			}

			if (paymentLinkMessage) {
				paymentLinkMessage.style.color = '#1f5c3f';
				paymentLinkMessage.textContent = 'Lien de paiement généré avec succès.';
			}

			paymentHistory.unshift({
				name: 'Lien de paiement',
				email: 'n/a',
				purpose,
				amount,
				date: new Date().toISOString().slice(0, 10),
				status: 'en attente',
				link: linkUrl
			});

			addAutomationLog({
				type: 'lien de paiement généré',
				user: 'Marie Tchana',
				status: 'succès'
			});

			buildUserFilterOptions();
			applyPaymentFilters();

			if (actionMessage) {
				actionMessage.style.color = '#1f5c3f';
				actionMessage.textContent = `Nouveau lien créé (${reference}).`;
			}
		});
	}

	[searchPayment, filterPaymentStatus, filterPaymentDate, filterPaymentUser].forEach((el) => {
		if (el) {
			el.addEventListener('input', applyPaymentFilters);
			el.addEventListener('change', applyPaymentFilters);
		}
	});

	buildUserFilterOptions();
	applyPaymentFilters();
}

const automationPage = document.querySelector('.automation-page');

if (automationPage) {
	// =========================================================
	// PAGE 6 - AUTOMATISATION
	// État, logs, export et règles de simulation.
	// =========================================================
	const statusGrid = document.getElementById('automation-status-grid');
	const logsBody = document.getElementById('automation-logs-body');
	const logsCount = document.getElementById('automation-logs-count');
	const exportMessage = document.getElementById('automation-export-message');
	const rulesGrid = document.getElementById('automation-rules-grid');
	const exportTypeSelect = document.getElementById('export-type');
	const exportPeriodSelect = document.getElementById('export-period');

	function getRulesWithRuntime() {
		return getAutomationRules().map((rule, index) => ({
			...rule,
			lastRun: rule.lastRun || `${18 - index}/05/2026 08:0${index}`
		}));
	}

	function renderAutomationStatuses() {
		if (!statusGrid) return;
		const modules = [
			{ key: 'payment-to-excel', title: 'Synchronisation paiements vers Excel' },
			{ key: 'upload-document-store', title: 'Enregistrement des fichiers déposés' },
			{ key: 'dashboard-update', title: 'Mise à jour du tableau de bord' },
			{ key: 'document-archive', title: 'Archivage automatique des documents' }
		];
		const rules = getRulesWithRuntime();

		statusGrid.innerHTML = modules
			.map((module, index) => {
				const rule = rules[index] || rules[0];
				const active = rule?.active ?? index < 2;
				return `
					<article class="automation-card">
						<p class="automation-card-title">${module.title}</p>
						<div class="automation-meta">
							<span class="automation-status ${active ? 'active' : 'inactive'}">${active ? 'actif (simulé)' : 'inactif (simulé)'}</span>
							<button class="table-btn" type="button" data-auto-toggle="${module.key}">${active ? 'désactiver' : 'activer'}</button>
						</div>
						<p class="subtitle">Dernière exécution : ${rule?.lastRun || '17/05/2026 08:30'}</p>
					</article>
				`;
			})
			.join('');
	}

	function renderAutomationLogs() {
		if (!logsBody) return;
		const logs = getAutomationLogs();
		if (!logs.length) {
			logsBody.innerHTML = '<tr><td class="table-empty" colspan="4">Aucun log disponible.</td></tr>';
			if (logsCount) logsCount.textContent = '0 événement enregistré.';
			return;
		}

		logsBody.innerHTML = logs
			.map(
				(log) => `<tr>
					<td>${log.type}</td>
					<td>${log.user}</td>
					<td>${formatLocalDateTime(log.dateTime)}</td>
					<td><span class="status-pill ${log.status === 'succès' ? 'status-paid' : 'status-failed'}">${log.status}</span></td>
				</tr>`
			)
			.join('');

		if (logsCount) logsCount.textContent = `${logs.length} événement${logs.length > 1 ? 's' : ''} enregistré${logs.length > 1 ? 's' : ''}.`;
	}

	function renderAutomationRules() {
		if (!rulesGrid) return;
		const rules = getRulesWithRuntime();
		rulesGrid.innerHTML = rules
			.map(
				(rule) => `
					<div class="automation-rule">
						<div class="automation-rule-top">
							<div>
								<p class="automation-card-title">${rule.label}</p>
								<p class="automation-rule-desc">${rule.description}</p>
							</div>
							<label class="toggle-switch" aria-label="Basculer la règle ${rule.label}">
								<input type="checkbox" data-rule-toggle="${rule.id}" ${rule.active ? 'checked' : ''} />
								<span class="toggle-slider"></span>
							</label>
						</div>
						<p class="subtitle">Statut : <strong>${rule.active ? 'actif' : 'inactif'}</strong></p>
					</div>
				`
			)
			.join('');
	}

	function getExportData(type, period) {
		const payments = getAutomationSamplePayments();
		const files = getAutomationSampleFiles();
		const now = new Date('2026-05-19T12:00:00');
		const limitDays = period === 'all' ? null : Number(period);
		const filterByPeriod = (itemDate) => {
			if (!limitDays) return true;
			const diff = (now - new Date(itemDate)) / (1000 * 60 * 60 * 24);
			return diff <= limitDays;
		};

		const filteredPayments = payments.filter((item) => filterByPeriod(item.date));
		const filteredFiles = files.filter((item) => filterByPeriod(item.date));

		if (type === 'payments') return filteredPayments;
		if (type === 'files') return filteredFiles;
		return { payments: filteredPayments, files: filteredFiles, logs: getAutomationLogs() };
	}

	function simulateExport(type) {
		const format = exportTypeSelect?.value || 'xlsx';
		const period = exportPeriodSelect?.value || 'all';
		const data = getExportData(type, period);
		const fileName = `${type}-export-${period}.${format}`;
		const content = JSON.stringify(data, null, 2);
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = fileName;
		link.click();
		URL.revokeObjectURL(link.href);
		addAutomationLog({ type: 'export effectué', user: 'Marie Tchana', status: 'succès' });
		if (exportMessage) {
			exportMessage.style.color = '#1f5c3f';
			exportMessage.textContent = `Export ${type} simulé généré au format ${format.toUpperCase()}.`;
		}
		renderAutomationLogs();
	}

	if (statusGrid) {
		statusGrid.addEventListener('click', (event) => {
			const btn = event.target.closest('button[data-auto-toggle]');
			if (!btn) return;
			const ruleId = btn.dataset.autoToggle;
			const rules = getAutomationRules();
			const updatedRules = rules.map((rule) =>
				rule.id === ruleId ? { ...rule, active: !rule.active, lastRun: new Date('2026-05-19T09:15:00').toLocaleString('fr-FR') } : rule
			);
			setAutomationRules(updatedRules);
			addAutomationLog({
				type: `règle ${updatedRules.find((rule) => rule.id === ruleId)?.active ? 'activée' : 'désactivée'}`,
				user: 'Marie Tchana',
				status: 'succès'
			});
			renderAutomationStatuses();
			renderAutomationRules();
			renderAutomationLogs();
		});
	}

	if (rulesGrid) {
		rulesGrid.addEventListener('change', (event) => {
			const toggle = event.target.closest('input[data-rule-toggle]');
			if (!toggle) return;
			const ruleId = toggle.dataset.ruleToggle;
			const rules = getAutomationRules();
			const updatedRules = rules.map((rule) =>
				rule.id === ruleId ? { ...rule, active: toggle.checked, lastRun: new Date().toLocaleString('fr-FR') } : rule
			);
			setAutomationRules(updatedRules);
			addAutomationLog({
				type: `règle ${toggle.checked ? 'activée' : 'désactivée'}`,
				user: 'Marie Tchana',
				status: 'succès'
			});
			renderAutomationStatuses();
			renderAutomationLogs();
		});
	}

	document.querySelectorAll('[data-export]').forEach((button) => {
		button.addEventListener('click', () => simulateExport(button.dataset.export));
	});

	renderAutomationStatuses();
	renderAutomationLogs();
	renderAutomationRules();
}

if (paymentLinkPage) {
	// =========================================================
	// PAGE CLIENT - PAIEMENT PAR LIEN
	// Checkout réaliste simulé (aucune transaction réelle).
	// =========================================================
	const amountTarget = document.getElementById('link-page-amount');
	const purposeTarget = document.getElementById('link-page-purpose');
	const referenceTarget = document.getElementById('link-page-reference');
	const checkoutForm = document.getElementById('link-page-form');
	const checkoutName = document.getElementById('checkout-name');
	const checkoutEmail = document.getElementById('checkout-email');
	const checkoutCard = document.getElementById('checkout-card');
	const checkoutExpiry = document.getElementById('checkout-expiry');
	const checkoutCvc = document.getElementById('checkout-cvc');
	const checkoutConsent = document.getElementById('checkout-consent');
	const payBtn = document.getElementById('link-page-pay-btn');
	const pageMessage = document.getElementById('link-page-message');

	const params = new URLSearchParams(window.location.search);
	const amountParam = params.get('amount') || '0';
	const purposeParam = params.get('objet') || 'Paiement ONG Foresterie';
	const referenceParam = params.get('ref') || 'PAY-DEMO-000';
	const amountValue = Number(amountParam);

	if (purposeTarget) {
		purposeTarget.textContent = purposeParam;
	}

	if (referenceTarget) {
		referenceTarget.textContent = referenceParam;
	}

	if (amountTarget) {
		amountTarget.textContent = Number.isFinite(amountValue) && amountValue > 0 ? `€ ${amountValue.toFixed(2)}` : '€ 0.00';
	}

	if (checkoutCard) {
		checkoutCard.addEventListener('input', () => {
			// Format 16 chiffres en groupes de 4.
			const digits = checkoutCard.value.replace(/\D/g, '').slice(0, 16);
			checkoutCard.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
		});
	}

	if (checkoutExpiry) {
		checkoutExpiry.addEventListener('input', () => {
			// Force le format MM/AA.
			const digits = checkoutExpiry.value.replace(/\D/g, '').slice(0, 4);
			checkoutExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
		});
	}

	if (checkoutCvc) {
		checkoutCvc.addEventListener('input', () => {
			// Limite le CVC à 3-4 chiffres.
			checkoutCvc.value = checkoutCvc.value.replace(/\D/g, '').slice(0, 4);
		});
	}

	if (checkoutForm && payBtn) {
		checkoutForm.addEventListener('submit', (event) => {
			// Validation simulée du formulaire de paiement.
			event.preventDefault();

			const name = checkoutName?.value.trim() || '';
			const email = checkoutEmail?.value.trim() || '';
			const cardDigits = (checkoutCard?.value || '').replace(/\s/g, '');
			const expiry = checkoutExpiry?.value.trim() || '';
			const cvc = checkoutCvc?.value.trim() || '';

			const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
			const expiryIsValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);

			if (!name || !email || !cardDigits || !expiry || !cvc) {
				if (pageMessage) {
					pageMessage.style.color = '#b02a37';
					pageMessage.textContent = 'Veuillez remplir toutes les informations.';
				}
				return;
			}

			if (!emailIsValid) {
				if (pageMessage) {
					pageMessage.style.color = '#b02a37';
					pageMessage.textContent = 'Adresse email invalide.';
				}
				return;
			}

			if (cardDigits.length < 16 || !expiryIsValid || cvc.length < 3) {
				if (pageMessage) {
					pageMessage.style.color = '#b02a37';
					pageMessage.textContent = 'Informations de carte invalides.';
				}
				return;
			}

			if (!checkoutConsent?.checked) {
				if (pageMessage) {
					pageMessage.style.color = '#b02a37';
					pageMessage.textContent = 'Veuillez accepter les conditions.';
				}
				return;
			}

			payBtn.disabled = true;
			payBtn.textContent = 'Traitement...';
			if (pageMessage) {
				pageMessage.style.color = '#1f5c3f';
				pageMessage.textContent = 'Vérification et confirmation du paiement...';
			}

			setTimeout(() => {
				payBtn.disabled = false;
				payBtn.textContent = 'Payer maintenant';
				if (pageMessage) {
					pageMessage.style.color = '#1f5c3f';
					pageMessage.textContent = `Paiement confirmé. Reçu envoyé à ${email}.`;
				}
			}, 1200);
		});
	}
}

const uploadPage = document.querySelector('.upload-page');

if (uploadPage) {
	// =========================================================
	// PAGE 3 - DÉPÔT DE FICHIERS
	// Drag & drop, sélection manuelle et historique local.
	// =========================================================
	const uploadForm = document.getElementById('upload-form');
	const fileInput = document.getElementById('upload-file-input');
	const selectFileBtn = document.getElementById('select-file-btn');
	const dropZone = document.getElementById('drop-zone');
	const selectedFileName = document.getElementById('selected-file-name');
	const titleInput = document.getElementById('upload-title');
	const categoryInput = document.getElementById('upload-category');
	const formMessage = document.getElementById('upload-form-message');
	const historyList = document.getElementById('upload-history');

	let currentFile = null;

	const uploadHistory = [
		{ title: 'Rapport reboisement avril', category: 'rapport', fileName: 'rapport_avril.pdf', date: '17/05/2026' },
		{ title: 'Analyse sols zone nord', category: 'analyse', fileName: 'analyse_sols.xlsx', date: '15/05/2026' }
	];

	function refreshSelectedFileText() {
		// Met à jour l'état visuel du fichier sélectionné.
		if (!selectedFileName) return;
		selectedFileName.textContent = currentFile ? `Fichier sélectionné: ${currentFile.name}` : 'Aucun fichier sélectionné.';
	}

	function renderUploadHistory() {
		// Rend la liste locale des fichiers déposés.
		if (!historyList) return;
		if (!uploadHistory.length) {
			historyList.innerHTML = '<li>Aucun fichier déposé.</li>';
			return;
		}

		historyList.innerHTML = uploadHistory
			.map(
				(item) =>
					`<li class="upload-history-item"><span>${item.title} (${item.category})</span><small>${item.fileName} • ${item.date}</small></li>`
			)
			.join('');
	}

	function bindDropZoneEvents() {
		// Gère les interactions drag & drop sur la zone de dépôt.
		if (!dropZone) return;

		['dragenter', 'dragover'].forEach((eventName) => {
			dropZone.addEventListener(eventName, (event) => {
				event.preventDefault();
				dropZone.classList.add('drop-zone-active');
			});
		});

		['dragleave', 'drop'].forEach((eventName) => {
			dropZone.addEventListener(eventName, (event) => {
				event.preventDefault();
				dropZone.classList.remove('drop-zone-active');
			});
		});

		dropZone.addEventListener('drop', (event) => {
			const file = event.dataTransfer?.files?.[0];
			if (!file) return;
			currentFile = file;
			refreshSelectedFileText();
		});

		dropZone.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				fileInput?.click();
			}
		});
	}

	if (selectFileBtn) {
		selectFileBtn.addEventListener('click', () => fileInput?.click());
	}

	if (fileInput) {
		fileInput.addEventListener('change', () => {
			currentFile = fileInput.files?.[0] || null;
			refreshSelectedFileText();
		});
	}

	if (uploadForm) {
		uploadForm.addEventListener('submit', (event) => {
			event.preventDefault();

			const title = titleInput?.value.trim() || '';
			const category = categoryInput?.value || '';

			if (!currentFile || !title || !category) {
				if (formMessage) {
					formMessage.style.color = '#b02a37';
					formMessage.textContent = 'Veuillez sélectionner un fichier, un titre et une catégorie.';
				}
				return;
			}

			uploadHistory.unshift({
				title,
				category,
				fileName: currentFile.name,
				date: new Date().toLocaleDateString('fr-FR')
			});
			addAutomationLog({ type: 'fichier ajouté', user: 'Marie Tchana', status: 'succès' });

			renderUploadHistory();
			uploadForm.reset();
			currentFile = null;
			refreshSelectedFileText();

			if (formMessage) {
				formMessage.style.color = '#1f5c3f';
				formMessage.textContent = 'Dépôt simulé ajouté à l’historique local.';
			}
		});
	}

	bindDropZoneEvents();
	renderUploadHistory();
	refreshSelectedFileText();
}
