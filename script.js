// ScoreStatsFC - Football Data & Analytics Platform
// Created by Kevin Naufal Aryanto & Reiki Putra Darmawan

// Global Variables
let currentUser = null;
let currentLeague = null;
let currentDate = null;

// Mock Data for 5 European Leagues
const mockData = {
    leagues: {
        'premier': {
            name: 'Premier League',
            country: 'Inggris',
            clubs: 20,
            season: '2023/24',
            logo: 'https://via.placeholder.com/100x100/1e40af/ffffff?text=PL'
        },
        'serie-a': {
            name: 'Serie A',
            country: 'Italia',
            clubs: 20,
            season: '2023/24',
            logo: 'https://via.placeholder.com/100x100/059669/ffffff?text=SA'
        },
        'bundesliga': {
            name: 'Bundesliga',
            country: 'Jerman',
            clubs: 18,
            season: '2023/24',
            logo: 'https://via.placeholder.com/100x100/dc2626/ffffff?text=BL'
        },
        'laliga': {
            name: 'La Liga',
            country: 'Spanyol',
            clubs: 20,
            season: '2023/24',
            logo: 'https://via.placeholder.com/100x100/ea580c/ffffff?text=LL'
        },
        'ligue1': {
            name: 'Ligue 1',
            country: 'Prancis',
            clubs: 18,
            season: '2023/24',
            logo: 'https://via.placeholder.com/100x100/7c3aed/ffffff?text=L1'
        }
    },
    
    clubs: {
        'premier': [
            { id: 1, name: 'Arsenal', manager: 'Mikel Arteta', founded: 1886 },
            { id: 2, name: 'Chelsea', manager: 'Mauricio Pochettino', founded: 1905 },
            { id: 3, name: 'Liverpool', manager: 'Jürgen Klopp', founded: 1892 },
            { id: 4, name: 'Manchester City', manager: 'Pep Guardiola', founded: 1880 },
            { id: 5, name: 'Manchester United', manager: 'Erik ten Hag', founded: 1878 },
            { id: 6, name: 'Tottenham', manager: 'Ange Postecoglou', founded: 1882 },
            { id: 7, name: 'Newcastle', manager: 'Eddie Howe', founded: 1892 },
            { id: 8, name: 'Brighton', manager: 'Roberto De Zerbi', founded: 1901 },
            { id: 9, name: 'West Ham', manager: 'David Moyes', founded: 1895 },
            { id: 10, name: 'Aston Villa', manager: 'Unai Emery', founded: 1874 }
        ],
        'serie-a': [
            { id: 11, name: 'Inter Milan', manager: 'Simone Inzaghi', founded: 1908 },
            { id: 12, name: 'AC Milan', manager: 'Stefano Pioli', founded: 1899 },
            { id: 13, name: 'Juventus', manager: 'Massimiliano Allegri', founded: 1897 },
            { id: 14, name: 'Napoli', manager: 'Walter Mazzarri', founded: 1926 },
            { id: 15, name: 'Roma', manager: 'José Mourinho', founded: 1927 },
            { id: 16, name: 'Lazio', manager: 'Maurizio Sarri', founded: 1900 },
            { id: 17, name: 'Atalanta', manager: 'Gian Piero Gasperini', founded: 1907 },
            { id: 18, name: 'Fiorentina', manager: 'Vincenzo Italiano', founded: 1926 },
            { id: 19, name: 'Bologna', manager: 'Thiago Motta', founded: 1909 },
            { id: 20, name: 'Torino', manager: 'Ivan Jurić', founded: 1906 }
        ],
        'bundesliga': [
            { id: 21, name: 'Bayern Munich', manager: 'Thomas Tuchel', founded: 1900 },
            { id: 22, name: 'Borussia Dortmund', manager: 'Edin Terzić', founded: 1909 },
            { id: 23, name: 'RB Leipzig', manager: 'Marco Rose', founded: 2009 },
            { id: 24, name: 'Bayer Leverkusen', manager: 'Xabi Alonso', founded: 1904 },
            { id: 25, name: 'Eintracht Frankfurt', manager: 'Dino Toppmöller', founded: 1899 },
            { id: 26, name: 'VfB Stuttgart', manager: 'Sebastian Hoeneß', founded: 1893 },
            { id: 27, name: 'SC Freiburg', manager: 'Christian Streich', founded: 1904 },
            { id: 28, name: 'Hoffenheim', manager: 'Pellegrino Matarazzo', founded: 1899 },
            { id: 29, name: 'Wolfsburg', manager: 'Niko Kovač', founded: 1945 },
            { id: 30, name: 'Werder Bremen', manager: 'Ole Werner', founded: 1899 }
        ],
        'laliga': [
            { id: 31, name: 'Real Madrid', manager: 'Carlo Ancelotti', founded: 1902 },
            { id: 32, name: 'Barcelona', manager: 'Xavi Hernández', founded: 1899 },
            { id: 33, name: 'Atletico Madrid', manager: 'Diego Simeone', founded: 1903 },
            { id: 34, name: 'Real Sociedad', manager: 'Imanol Alguacil', founded: 1909 },
            { id: 35, name: 'Villarreal', manager: 'Quique Setién', founded: 1923 },
            { id: 36, name: 'Real Betis', manager: 'Manuel Pellegrini', founded: 1907 },
            { id: 37, name: 'Sevilla', manager: 'Quique Sánchez Flores', founded: 1890 },
            { id: 38, name: 'Athletic Bilbao', manager: 'Ernesto Valverde', founded: 1898 },
            { id: 39, name: 'Valencia', manager: 'Rubén Baraja', founded: 1919 },
            { id: 40, name: 'Osasuna', manager: 'Jagoba Arrasate', founded: 1920 }
        ],
        'ligue1': [
            { id: 41, name: 'PSG', manager: 'Luis Enrique', founded: 1970 },
            { id: 42, name: 'Monaco', manager: 'Adi Hütter', founded: 1924 },
            { id: 43, name: 'Marseille', manager: 'Gennaro Gattuso', founded: 1899 },
            { id: 44, name: 'Lyon', manager: 'Laurent Blanc', founded: 1950 },
            { id: 45, name: 'Lille', manager: 'Paulo Fonseca', founded: 1944 },
            { id: 46, name: 'Rennes', manager: 'Bruno Génésio', founded: 1901 },
            { id: 47, name: 'Nice', manager: 'Francesco Farioli', founded: 1904 },
            { id: 48, name: 'Lens', manager: 'Franck Haise', founded: 1906 },
            { id: 49, name: 'Reims', manager: 'Will Still', founded: 1911 },
            { id: 50, name: 'Montpellier', manager: 'Michel Der Zakarian', founded: 1919 }
        ]
    },
    
    players: [
        { id: 1, name: 'Erling Haaland', club: 'Manchester City', position: 'ST', age: 23, country: 'Norway', value: 180 },
        { id: 2, name: 'Kylian Mbappé', club: 'PSG', position: 'ST', age: 25, country: 'France', value: 180 },
        { id: 3, name: 'Jude Bellingham', club: 'Real Madrid', position: 'CM', age: 20, country: 'England', value: 120 },
        { id: 4, name: 'Vinicius Jr', club: 'Real Madrid', position: 'LW', age: 23, country: 'Brazil', value: 150 },
        { id: 5, name: 'Harry Kane', club: 'Bayern Munich', position: 'ST', age: 30, country: 'England', value: 100 },
        { id: 6, name: 'Mohamed Salah', club: 'Liverpool', position: 'RW', age: 31, country: 'Egypt', value: 80 },
        { id: 7, name: 'Kevin De Bruyne', club: 'Manchester City', position: 'CAM', age: 32, country: 'Belgium', value: 70 },
        { id: 8, name: 'Luka Modrić', club: 'Real Madrid', position: 'CM', age: 38, country: 'Croatia', value: 10 },
        { id: 9, name: 'Virgil van Dijk', club: 'Liverpool', position: 'CB', age: 32, country: 'Netherlands', value: 40 },
        { id: 10, name: 'Manuel Neuer', club: 'Bayern Munich', position: 'GK', age: 37, country: 'Germany', value: 5 }
    ],
    
    transfers: [
        { id: 1, player: 'Jude Bellingham', from: 'Borussia Dortmund', to: 'Real Madrid', fee: 103, date: '2023-06-14' },
        { id: 2, player: 'Harry Kane', from: 'Tottenham', to: 'Bayern Munich', fee: 100, date: '2023-08-12' },
        { id: 3, player: 'Declan Rice', from: 'West Ham', to: 'Arsenal', fee: 105, date: '2023-07-15' },
        { id: 4, player: 'Moises Caicedo', from: 'Brighton', to: 'Chelsea', fee: 115, date: '2023-08-14' },
        { id: 5, player: 'Rasmus Højlund', from: 'Atalanta', to: 'Manchester United', fee: 75, date: '2023-08-05' },
        { id: 6, player: 'Mason Mount', from: 'Chelsea', to: 'Manchester United', fee: 60, date: '2023-07-05' },
        { id: 7, player: 'Kai Havertz', from: 'Chelsea', to: 'Arsenal', fee: 65, date: '2023-06-28' },
        { id: 8, player: 'Sandro Tonali', from: 'AC Milan', to: 'Newcastle', fee: 70, date: '2023-07-03' }
    ],
    
    fixtures: {
        'premier': [
            { id: 1, home: 'Arsenal', away: 'Chelsea', homeScore: 2, awayScore: 1, date: '2024-01-15', time: '15:00', status: 'finished' },
            { id: 2, home: 'Liverpool', away: 'Manchester City', homeScore: 1, awayScore: 1, date: '2024-01-15', time: '17:30', status: 'finished' },
            { id: 3, home: 'Manchester United', away: 'Tottenham', homeScore: 3, awayScore: 0, date: '2024-01-16', time: '14:00', status: 'finished' },
            { id: 4, home: 'Newcastle', away: 'Brighton', homeScore: 2, awayScore: 2, date: '2024-01-16', time: '16:00', status: 'finished' },
            { id: 5, home: 'West Ham', away: 'Aston Villa', homeScore: 1, awayScore: 3, date: '2024-01-17', time: '15:30', status: 'finished' },
            { id: 6, home: 'Chelsea', away: 'Liverpool', homeScore: null, awayScore: null, date: '2024-01-20', time: '15:00', status: 'upcoming' },
            { id: 7, home: 'Manchester City', away: 'Arsenal', homeScore: null, awayScore: null, date: '2024-01-20', time: '17:30', status: 'upcoming' },
            { id: 8, home: 'Tottenham', away: 'Newcastle', homeScore: null, awayScore: null, date: '2024-01-21', time: '14:00', status: 'upcoming' },
            { id: 9, home: 'Brighton', away: 'West Ham', homeScore: null, awayScore: null, date: '2024-01-21', time: '16:00', status: 'upcoming' },
            { id: 10, home: 'Aston Villa', away: 'Manchester United', homeScore: null, awayScore: null, date: '2024-01-22', time: '15:30', status: 'upcoming' },
            { id: 11, home: 'Arsenal', away: 'Newcastle', homeScore: null, awayScore: null, date: '2024-01-23', time: '20:00', status: 'upcoming' },
            { id: 12, home: 'Liverpool', away: 'West Ham', homeScore: null, awayScore: null, date: '2024-01-24', time: '19:30', status: 'upcoming' },
            { id: 13, home: 'Manchester City', away: 'Brighton', homeScore: null, awayScore: null, date: '2024-01-25', time: '17:30', status: 'upcoming' },
            { id: 14, home: 'Chelsea', away: 'Tottenham', homeScore: null, awayScore: null, date: '2024-01-26', time: '15:00', status: 'upcoming' }
        ],
        'serie-a': [
            { id: 15, home: 'Inter Milan', away: 'AC Milan', homeScore: 1, awayScore: 0, date: '2024-01-14', time: '20:45', status: 'finished' },
            { id: 16, home: 'Juventus', away: 'Napoli', homeScore: 2, awayScore: 2, date: '2024-01-14', time: '18:00', status: 'finished' },
            { id: 17, home: 'Roma', away: 'Lazio', homeScore: 3, awayScore: 1, date: '2024-01-15', time: '15:00', status: 'finished' },
            { id: 18, home: 'Atalanta', away: 'Fiorentina', homeScore: 2, awayScore: 0, date: '2024-01-15', time: '18:30', status: 'finished' },
            { id: 19, home: 'Bologna', away: 'Torino', homeScore: 1, awayScore: 1, date: '2024-01-16', time: '15:00', status: 'finished' },
            { id: 20, home: 'AC Milan', away: 'Juventus', homeScore: null, awayScore: null, date: '2024-01-19', time: '20:45', status: 'upcoming' },
            { id: 21, home: 'Napoli', away: 'Roma', homeScore: null, awayScore: null, date: '2024-01-19', time: '18:00', status: 'upcoming' },
            { id: 22, home: 'Lazio', away: 'Atalanta', homeScore: null, awayScore: null, date: '2024-01-20', time: '15:00', status: 'upcoming' }
        ],
        'bundesliga': [
            { id: 23, home: 'Bayern Munich', away: 'Borussia Dortmund', homeScore: 4, awayScore: 0, date: '2024-01-13', time: '17:30', status: 'finished' },
            { id: 24, home: 'RB Leipzig', away: 'Bayer Leverkusen', homeScore: 2, awayScore: 3, date: '2024-01-13', time: '15:30', status: 'finished' },
            { id: 25, home: 'Eintracht Frankfurt', away: 'VfB Stuttgart', homeScore: 1, awayScore: 2, date: '2024-01-14', time: '15:30', status: 'finished' },
            { id: 26, home: 'SC Freiburg', away: 'Hoffenheim', homeScore: 3, awayScore: 1, date: '2024-01-14', time: '15:30', status: 'finished' },
            { id: 27, home: 'Wolfsburg', away: 'Werder Bremen', homeScore: 0, awayScore: 1, date: '2024-01-15', time: '15:30', status: 'finished' },
            { id: 28, home: 'Borussia Dortmund', away: 'RB Leipzig', homeScore: null, awayScore: null, date: '2024-01-18', time: '17:30', status: 'upcoming' },
            { id: 29, home: 'Bayer Leverkusen', away: 'Bayern Munich', homeScore: null, awayScore: null, date: '2024-01-18', time: '15:30', status: 'upcoming' },
            { id: 30, home: 'VfB Stuttgart', away: 'SC Freiburg', homeScore: null, awayScore: null, date: '2024-01-19', time: '15:30', status: 'upcoming' }
        ],
        'laliga': [
            { id: 31, home: 'Real Madrid', away: 'Barcelona', homeScore: 2, awayScore: 1, date: '2024-01-12', time: '21:00', status: 'finished' },
            { id: 32, home: 'Atletico Madrid', away: 'Real Sociedad', homeScore: 1, awayScore: 1, date: '2024-01-12', time: '18:30', status: 'finished' },
            { id: 33, home: 'Villarreal', away: 'Real Betis', homeScore: 3, awayScore: 2, date: '2024-01-13', time: '16:00', status: 'finished' },
            { id: 34, home: 'Sevilla', away: 'Athletic Bilbao', homeScore: 0, awayScore: 2, date: '2024-01-13', time: '18:00', status: 'finished' },
            { id: 35, home: 'Valencia', away: 'Osasuna', homeScore: 2, awayScore: 0, date: '2024-01-14', time: '16:00', status: 'finished' },
            { id: 36, home: 'Barcelona', away: 'Atletico Madrid', homeScore: null, awayScore: null, date: '2024-01-17', time: '21:00', status: 'upcoming' },
            { id: 37, home: 'Real Sociedad', away: 'Villarreal', homeScore: null, awayScore: null, date: '2024-01-17', time: '18:30', status: 'upcoming' },
            { id: 38, home: 'Real Betis', away: 'Sevilla', homeScore: null, awayScore: null, date: '2024-01-18', time: '16:00', status: 'upcoming' }
        ],
        'ligue1': [
            { id: 39, home: 'PSG', away: 'Monaco', homeScore: 3, awayScore: 1, date: '2024-01-11', time: '21:00', status: 'finished' },
            { id: 40, home: 'Marseille', away: 'Lyon', homeScore: 2, awayScore: 2, date: '2024-01-11', time: '21:00', status: 'finished' },
            { id: 41, home: 'Lille', away: 'Rennes', homeScore: 1, awayScore: 3, date: '2024-01-12', time: '17:00', status: 'finished' },
            { id: 42, home: 'Nice', away: 'Lens', homeScore: 0, awayScore: 1, date: '2024-01-12', time: '17:00', status: 'finished' },
            { id: 43, home: 'Reims', away: 'Montpellier', homeScore: 2, awayScore: 1, date: '2024-01-13', time: '15:00', status: 'finished' },
            { id: 44, home: 'Monaco', away: 'Marseille', homeScore: null, awayScore: null, date: '2024-01-16', time: '21:00', status: 'upcoming' },
            { id: 45, home: 'Lyon', away: 'Lille', homeScore: null, awayScore: null, date: '2024-01-16', time: '21:00', status: 'upcoming' },
            { id: 46, home: 'Rennes', away: 'Nice', homeScore: null, awayScore: null, date: '2024-01-17', time: '17:00', status: 'upcoming' }
        ]
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    initializeDateSelector();
    loadPlayers();
    loadClubs();
    loadTransfers();
    checkLoginStatus();
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    // League selection
    document.querySelectorAll('.league-card').forEach(card => {
        card.addEventListener('click', function() {
            const league = this.getAttribute('data-league');
            selectLeague(league);
        });
    });

    // Date selection
    document.getElementById('dateSelect').addEventListener('change', function() {
        const selectedDate = this.value;
        if (selectedDate && currentLeague) {
            loadFixturesByDate(currentLeague, selectedDate);
        }
    });

    // Quick date buttons
    document.getElementById('todayBtn').addEventListener('click', function() {
        setQuickDate('today');
    });

    document.getElementById('tomorrowBtn').addEventListener('click', function() {
        setQuickDate('tomorrow');
    });

    document.getElementById('weekBtn').addEventListener('click', function() {
        showWeekFixtures();
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const query = this.value;
        if (query.length >= 2) {
            performSearch(query);
        } else {
            hideSearchResults();
        }
    });

    // Modal functionality
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    document.getElementById('registerBtn').addEventListener('click', showRegisterModal);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

    // Load page-specific content
    switch(pageId) {
        case 'home':
            if (currentLeague && currentDate) {
                loadFixturesByDate(currentLeague, currentDate);
            }
            break;
        case 'leagues':
            loadLeaguesPage();
            break;
        case 'players':
            loadPlayers();
            break;
        case 'clubs':
            loadClubs();
            break;
        case 'transfers':
            loadTransfers();
            break;
    }
}

// League Selection
function selectLeague(leagueId) {
    currentLeague = leagueId;
    
    // Update UI to show selected league
    document.querySelectorAll('.league-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-league="${leagueId}"]`).classList.add('selected');

    // Show date selector
    document.querySelector('.date-selector').style.display = 'block';
    
    // Load fixtures for today if no date selected
    if (!currentDate) {
        const today = new Date().toISOString().split('T')[0];
        setQuickDate('today');
    } else {
        loadFixturesByDate(leagueId, currentDate);
    }
}

// Date Selector Initialization
function initializeDateSelector() {
    const dateInput = document.getElementById('dateSelect');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    currentDate = today;
}

// Quick Date Functions
function setQuickDate(type) {
    const dateInput = document.getElementById('dateSelect');
    const today = new Date();
    let targetDate;
    
    switch(type) {
        case 'today':
            targetDate = today.toISOString().split('T')[0];
            break;
        case 'tomorrow':
            targetDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
        case 'week':
            // This case is handled by showWeekFixtures function
            return;
    }
    
    dateInput.value = targetDate;
    currentDate = targetDate;
    
    // Update button states
    document.querySelectorAll('.date-controls .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(type + 'Btn').classList.add('active');
    
    // Load fixtures if league is selected
    if (currentLeague) {
        loadFixturesByDate(currentLeague, targetDate);
    }
}

// Load Fixtures by Date
function loadFixturesByDate(leagueId, date) {
    currentDate = date;
    const fixturesContainer = document.getElementById('fixturesContainer');
    
    if (!mockData.fixtures[leagueId]) {
        fixturesContainer.innerHTML = '<p class="text-center">Tidak ada data liga yang tersedia.</p>';
        return;
    }

    const fixtures = mockData.fixtures[leagueId].filter(fixture => fixture.date === date);
    const leagueName = mockData.leagues[leagueId].name;

    if (fixtures.length === 0) {
        fixturesContainer.innerHTML = `
            <div class="fixture-group">
                <h3>${leagueName} - ${formatDate(date)}</h3>
                <p class="text-center">Tidak ada pertandingan pada tanggal ini.</p>
            </div>
        `;
        return;
    }

    // Group fixtures by status
    const finishedFixtures = fixtures.filter(f => f.status === 'finished');
    const upcomingFixtures = fixtures.filter(f => f.status === 'upcoming');

    let fixturesHTML = `
        <div class="fixture-group">
            <h3>${leagueName} - ${formatDate(date)}</h3>
    `;

    if (finishedFixtures.length > 0) {
        fixturesHTML += `
            <h4 class="fixture-status finished">Pertandingan Selesai</h4>
            <div class="fixtures-list">
                ${finishedFixtures.map(fixture => `
                    <div class="fixture-item finished" onclick="showFixtureDetail(${fixture.id})">
                        <div class="fixture-teams">
                            <span class="fixture-team">${fixture.home}</span>
                            <span class="fixture-score">${fixture.homeScore} - ${fixture.awayScore}</span>
                            <span class="fixture-team">${fixture.away}</span>
                        </div>
                        <div class="fixture-time">${fixture.time}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (upcomingFixtures.length > 0) {
        fixturesHTML += `
            <h4 class="fixture-status upcoming">Pertandingan Mendatang</h4>
            <div class="fixtures-list">
                ${upcomingFixtures.map(fixture => `
                    <div class="fixture-item upcoming" onclick="showFixtureDetail(${fixture.id})">
                        <div class="fixture-teams">
                            <span class="fixture-team">${fixture.home}</span>
                            <span class="fixture-score">vs</span>
                            <span class="fixture-team">${fixture.away}</span>
                        </div>
                        <div class="fixture-time">${fixture.time}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    fixturesHTML += '</div>';
    fixturesContainer.innerHTML = fixturesHTML;
}

// Show Week Fixtures
function showWeekFixtures() {
    if (!currentLeague) {
        showMessage('Pilih liga terlebih dahulu', 'error');
        return;
    }

    const fixturesContainer = document.getElementById('fixturesContainer');
    const leagueName = mockData.leagues[currentLeague].name;
    const fixtures = mockData.fixtures[currentLeague];
    
    // Get next 7 days
    const today = new Date();
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        weekDates.push(date.toISOString().split('T')[0]);
    }

    let fixturesHTML = `
        <div class="fixture-group">
            <h3>${leagueName} - Jadwal Seminggu</h3>
    `;

    let hasFixtures = false;
    weekDates.forEach(date => {
        const dayFixtures = fixtures.filter(fixture => fixture.date === date);
        if (dayFixtures.length > 0) {
            hasFixtures = true;
            fixturesHTML += `
                <h4 class="day-header">${formatDate(date)}</h4>
                <div class="fixtures-list">
                    ${dayFixtures.map(fixture => `
                        <div class="fixture-item ${fixture.status}" onclick="showFixtureDetail(${fixture.id})">
                            <div class="fixture-teams">
                                <span class="fixture-team">${fixture.home}</span>
                                <span class="fixture-score">
                                    ${fixture.status === 'finished' ? `${fixture.homeScore} - ${fixture.awayScore}` : 'vs'}
                                </span>
                                <span class="fixture-team">${fixture.away}</span>
                            </div>
                            <div class="fixture-time">${fixture.time}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    });

    if (!hasFixtures) {
        fixturesHTML += '<p class="text-center">Tidak ada pertandingan dalam seminggu ke depan.</p>';
    }

    fixturesHTML += '</div>';
    fixturesContainer.innerHTML = fixturesHTML;

    // Update button states
    document.querySelectorAll('.date-controls .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('weekBtn').classList.add('active');
}

// Format Date Helper
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
}

// Load Players
function loadPlayers() {
    const playersGrid = document.getElementById('playersGrid');
    if (!playersGrid) return;

    playersGrid.innerHTML = mockData.players.map(player => `
        <div class="player-card" onclick="showPlayerDetail(${player.id})">
            <h3>${player.name}</h3>
            <p><strong>Klub:</strong> ${player.club}</p>
            <p><strong>Posisi:</strong> ${player.position}</p>
            <p><strong>Usia:</strong> ${player.age} tahun</p>
            <p><strong>Nilai:</strong> €${player.value}M</p>
        </div>
    `).join('');
}

// Load Clubs
function loadClubs() {
    const clubsGrid = document.getElementById('clubsGrid');
    if (!clubsGrid) return;

    let clubsHTML = '';
    Object.keys(mockData.clubs).forEach(leagueId => {
        const league = mockData.leagues[leagueId];
        clubsHTML += `
            <div class="league-section">
                <h3>${league.name}</h3>
                <div class="clubs-grid-inner">
                    ${mockData.clubs[leagueId].map(club => `
                        <div class="club-card" onclick="showClubDetail(${club.id})">
                            <h4>${club.name}</h4>
                            <p><strong>Manager:</strong> ${club.manager}</p>
                            <p><strong>Didirikan:</strong> ${club.founded}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    clubsGrid.innerHTML = clubsHTML;
}

// Load Transfers
function loadTransfers() {
    const transfersList = document.getElementById('transfersList');
    if (!transfersList) return;

    transfersList.innerHTML = mockData.transfers.map(transfer => `
        <div class="transfer-item">
            <div class="transfer-info">
                <span class="transfer-player">${transfer.player}</span>
                <div class="transfer-clubs">
                    <span>${transfer.from}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span>${transfer.to}</span>
                </div>
            </div>
            <div class="transfer-fee">€${transfer.fee}M</div>
        </div>
    `).join('');
}

// Load Leagues Page
function loadLeaguesPage() {
    const leaguesGrid = document.querySelector('.leagues-grid');
    if (!leaguesGrid) return;

    leaguesGrid.innerHTML = Object.keys(mockData.leagues).map(leagueId => {
        const league = mockData.leagues[leagueId];
        return `
            <div class="league-detail-card" data-league="${leagueId}">
                <div class="league-header">
                    <img src="${league.logo}" alt="${league.name}">
                    <div>
                        <h3>${league.name}</h3>
                        <p>${league.country} • ${league.clubs} Klub</p>
                    </div>
                </div>
                <div class="league-stats">
                    <div class="stat">
                        <span class="stat-label">Pertandingan</span>
                        <span class="stat-value">${league.clubs * 2}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Musim</span>
                        <span class="stat-value">${league.season}</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="viewLeague('${leagueId}')">Lihat Detail</button>
            </div>
        `;
    }).join('');
}

// Search Functionality
function performSearch(query) {
    const results = [];
    
    // Search players
    mockData.players.forEach(player => {
        if (player.name.toLowerCase().includes(query.toLowerCase()) ||
            player.club.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                type: 'player',
                id: player.id,
                name: player.name,
                subtitle: `${player.club} • ${player.position}`
            });
        }
    });

    // Search clubs
    Object.values(mockData.clubs).flat().forEach(club => {
        if (club.name.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                type: 'club',
                id: club.id,
                name: club.name,
                subtitle: club.manager
            });
        }
    });

    displaySearchResults(results);
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">Tidak ada hasil ditemukan</div>';
    } else {
        searchResults.innerHTML = results.slice(0, 6).map(result => `
            <div class="search-result-item" onclick="handleSearchResult('${result.type}', ${result.id})">
                <div>
                    <strong>${result.name}</strong>
                    <div style="font-size: 0.8rem; color: #6b7280;">${result.subtitle}</div>
                </div>
            </div>
        `).join('');
    }
    
    searchResults.style.display = 'block';
}

function hideSearchResults() {
    document.getElementById('searchResults').style.display = 'none';
}

function handleSearchResult(type, id) {
    hideSearchResults();
    document.getElementById('searchInput').value = '';
    
    if (type === 'player') {
        showPlayerDetail(id);
    } else if (type === 'club') {
        showClubDetail(id);
    }
}

// Authentication
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (username && password) {
        currentUser = { username, id: Date.now() };
        updateAuthUI();
        document.getElementById('loginModal').style.display = 'none';
        showMessage('Login berhasil!', 'success');
    } else {
        showMessage('Username dan password harus diisi!', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    // Simple validation
    if (username && email && password) {
        currentUser = { username, email, id: Date.now() };
        updateAuthUI();
        document.getElementById('registerModal').style.display = 'none';
        showMessage('Registrasi berhasil!', 'success');
    } else {
        showMessage('Semua field harus diisi!', 'error');
    }
}

function logout() {
    currentUser = null;
    updateAuthUI();
    showMessage('Logout berhasil!', 'success');
    showPage('home');
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

function checkLoginStatus() {
    // Check if user is logged in (in real app, this would check localStorage or session)
    updateAuthUI();
}

// Detail Views
function showFixtureDetail(fixtureId) {
    showMessage(`Detail pertandingan ${fixtureId} akan ditampilkan`, 'success');
}

function showPlayerDetail(playerId) {
    const player = mockData.players.find(p => p.id === playerId);
    if (player) {
        showMessage(`Detail pemain ${player.name} akan ditampilkan`, 'success');
    }
}

function showClubDetail(clubId) {
    // Find club in all leagues
    let club = null;
    Object.values(mockData.clubs).flat().find(c => c.id === clubId);
    
    if (club) {
        showMessage(`Detail klub ${club.name} akan ditampilkan`, 'success');
    }
}

function viewLeague(leagueId) {
    const league = mockData.leagues[leagueId];
    showMessage(`Detail liga ${league.name} akan ditampilkan`, 'success');
}

// Admin Functions
function showAddFixture() {
    if (!currentUser) {
        showMessage('Anda harus login untuk mengakses admin panel', 'error');
        return;
    }
    showMessage('Form tambah pertandingan akan ditampilkan', 'success');
}

function showManagePlayers() {
    if (!currentUser) {
        showMessage('Anda harus login untuk mengakses admin panel', 'error');
        return;
    }
    showMessage('Panel kelola pemain akan ditampilkan', 'success');
}

function showManageClubs() {
    if (!currentUser) {
        showMessage('Anda harus login untuk mengakses admin panel', 'error');
        return;
    }
    showMessage('Panel kelola klub akan ditampilkan', 'success');
}

// Utility Functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of main content
    const main = document.querySelector('.main');
    main.insertBefore(messageDiv, main.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Add some CSS for selected league card
const style = document.createElement('style');
style.textContent = `
    .league-card.selected {
        border-color: #3b82f6;
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    }
    
    .clubs-grid-inner {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .league-section {
        margin-bottom: 2rem;
    }
    
    .league-section h3 {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #1f2937;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e5e7eb;
    }
`;
document.head.appendChild(style);
