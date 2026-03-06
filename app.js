const monthYearDisplay = document.getElementById('month-year-display');
const daysContainer = document.getElementById('days-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const viewToggleBtn = document.getElementById('view-toggle-btn');

const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');

const scheduleModal = document.getElementById('schedule-modal');
const categoryModal = document.getElementById('category-modal');
const overlay = document.getElementById('overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const closeCategoryBtn = document.getElementById('close-category-btn');

const scheduleDateInput = document.getElementById('schedule-date');
// 🎯 범위 일정용 종료일 요소 가져오기
const scheduleRangeEndInput = document.getElementById('schedule-range-end');

const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');
const scheduleTitleInput = document.getElementById('schedule-title');
const scheduleCategoryInput = document.getElementById('schedule-category');
const modalTitle = document.querySelector('.modal-header h3');

const repeatUiGroup = document.getElementById('repeat-ui-group');
const scheduleRepeatInput = document.getElementById('schedule-repeat');
const repeatEndContainer = document.getElementById('repeat-end-container');
const scheduleRepeatEndInput = document.getElementById('schedule-repeat-end');

const manageCategoryBtn = document.getElementById('manage-category-btn');
const categoryListUl = document.getElementById('category-list');
const newCategoryName = document.getElementById('new-category-name');
const newCategoryColor = document.getElementById('new-category-color');
const addCategoryBtn = document.getElementById('add-category-btn');

const supabaseUrl = 'https://ezblpefylnxwjleazptf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YmxwZWZ5bG54d2psZWF6cHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTI5NTEsImV4cCI6MjA4NzU2ODk1MX0.i-ee5k9a6fyAivTdXMSLGzKmPAtkvqj9GrZWZf_Z7UM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentDate = new Date();
let schedulesList = [];
let categoriesList = []; 
let currentEditId = null;
let isWeeklyView = false;

// UI 제어 (사이드바, 모달)
sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
});

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}
closeSidebarBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
viewToggleBtn.addEventListener('click', closeSidebar);

function closeAllModals() {
    scheduleModal.classList.remove('active');
    categoryModal.classList.remove('active');
    overlay.classList.remove('active');
}
closeModalBtn.addEventListener('click', closeAllModals);
closeCategoryBtn.addEventListener('click', closeAllModals);
overlay.addEventListener('click', closeAllModals);

scheduleRepeatInput.addEventListener('change', (e) => {
    repeatEndContainer.style.display = e.target.value === 'none' ? 'none' : 'block';
});

// 카테고리 로직
manageCategoryBtn.addEventListener('click', () => {
    closeSidebar();
    categoryModal.classList.add('active');
    overlay.classList.add('active');
});

async function loadCategories() {
    const { data, error } = await supabaseClient.from('categories').select('*');
    if (!error) {
        categoriesList = data;
        renderCategoryManager();
        updateCategoryDropdown();
        loadSchedules(); 
    }
}

function renderCategoryManager() {
    categoryListUl.innerHTML = '';
    categoriesList.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.innerHTML = `
            <div class="category-info">
                <div class="category-color-dot" style="background-color: ${cat.color}"></div>
                <span>${cat.name}</span>
            </div>
            <button class="delete-cat-btn" data-id="${cat.id}">삭제</button>
        `;
        categoryListUl.appendChild(li);
    });

    document.querySelectorAll('.delete-cat-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm('이 카테고리를 삭제하시겠습니까?')) {
                await supabaseClient.from('categories').delete().eq('id', id);
                loadCategories();
            }
        });
    });
}

function updateCategoryDropdown() {
    scheduleCategoryInput.innerHTML = '';
    categoriesList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name; 
        option.textContent = cat.name;
        scheduleCategoryInput.appendChild(option);
    });
}

addCategoryBtn.addEventListener('click', async () => {
    const name = newCategoryName.value.trim();
    const color = newCategoryColor.value;
    if (!name) return alert('이름을 입력하세요!');

    addCategoryBtn.textContent = '처리 중...';
    const { error } = await supabaseClient.from('categories').insert([{ name, color }]);
    if (error) alert('추가 실패!');
    else { newCategoryName.value = ''; loadCategories(); }
    addCategoryBtn.textContent = '추가하기';
});

// 달력 렌더링
async function loadSchedules() {
    const { data, error } = await supabaseClient.from('schedules').select('*');
    if (!error) { schedulesList = data; renderCalendar(); }
}

function renderCalendar() {
    daysContainer.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (!isWeeklyView) {
        monthYearDisplay.textContent = `${year}년 ${month + 1}월`;
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell');
            emptyCell.style.visibility = 'hidden';
            daysContainer.appendChild(emptyCell);
        }
        for (let i = 1; i <= lastDay; i++) { createDayCell(year, month, i); }
    } else {
        const currentDayOfWeek = currentDate.getDay();
        const sunday = new Date(currentDate);
        sunday.setDate(currentDate.getDate() - currentDayOfWeek);
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);

        monthYearDisplay.textContent = `${sunday.getMonth() + 1}월 ${sunday.getDate()}일 ~ ${saturday.getMonth() + 1}월 ${saturday.getDate()}일`;

        for (let i = 0; i < 7; i++) {
            const renderDate = new Date(sunday);
            renderDate.setDate(sunday.getDate() + i);
            createDayCell(renderDate.getFullYear(), renderDate.getMonth(), renderDate.getDate());
        }
    }
}

function createDayCell(cellYear, cellMonth, cellDateNum) {
    const dayCell = document.createElement('div');
    dayCell.classList.add('day-cell');
    
    const dateNumber = document.createElement('div');
    dateNumber.textContent = cellDateNum;
    dayCell.appendChild(dateNumber);

    const today = new Date();
    if (cellYear === today.getFullYear() && cellMonth === today.getMonth() && cellDateNum === today.getDate()) {
        dayCell.classList.add('today'); 
    }

    const currentCellDate = `${cellYear}년 ${cellMonth + 1}월 ${cellDateNum}일`;
    const todaysSchedules = schedulesList.filter(schedule => schedule.date === currentCellDate);

    todaysSchedules.forEach(schedule => {
        const scheduleDiv = document.createElement('div');
        scheduleDiv.classList.add('schedule-bar');
        
        const matchedCategory = categoriesList.find(c => c.name === schedule.category);
        const bgColor = matchedCategory ? matchedCategory.color : '#4f46e5'; 
        
        scheduleDiv.style.backgroundColor = bgColor;
        scheduleDiv.style.color = '#ffffff';
        scheduleDiv.textContent = schedule.title;

        scheduleDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(currentCellDate, schedule); 
        });
        dayCell.appendChild(scheduleDiv);
    });

    dayCell.addEventListener('click', () => { openModal(currentCellDate); });
    daysContainer.appendChild(dayCell);
}

viewToggleBtn.addEventListener('click', () => {
    isWeeklyView = !isWeeklyView;
    viewToggleBtn.textContent = isWeeklyView ? '월간 보기' : '주간 보기';
    document.querySelector('.calendar-wrapper').classList.toggle('weekly-mode', isWeeklyView);
    renderCalendar();
});

prevBtn.addEventListener('click', () => { 
    if(isWeeklyView) currentDate.setDate(currentDate.getDate() - 7);
    else currentDate.setMonth(currentDate.getMonth() - 1); 
    renderCalendar(); 
});

nextBtn.addEventListener('click', () => { 
    if(isWeeklyView) currentDate.setDate(currentDate.getDate() + 7);
    else currentDate.setMonth(currentDate.getMonth() + 1); 
    renderCalendar(); 
});

// 🎯 저장 로직 (단일/범위/반복 모두 통합)
function openModal(dateString, schedule = null) {
    scheduleDateInput.value = dateString;
    scheduleModal.classList.add('active');
    overlay.classList.add('active');

    if (schedule) {
        currentEditId = schedule.id;
        scheduleTitleInput.value = schedule.title;
        scheduleCategoryInput.value = schedule.category;
        
        if(scheduleRangeEndInput) scheduleRangeEndInput.style.display = 'none';
        if(repeatUiGroup) repeatUiGroup.style.display = 'none';

        modalTitle.textContent = '일정 수정';
        saveBtn.textContent = '수정 완료';
        deleteBtn.style.display = 'block';
    } else {
        currentEditId = null;
        scheduleTitleInput.value = '';
        if(categoriesList.length > 0) scheduleCategoryInput.value = categoriesList[0].name; 
        
        if(scheduleRangeEndInput) {
            scheduleRangeEndInput.style.display = 'block';
            scheduleRangeEndInput.value = '';
        }
        if(repeatUiGroup) repeatUiGroup.style.display = 'block';
        scheduleRepeatInput.value = 'none';
        repeatEndContainer.style.display = 'none';
        scheduleRepeatEndInput.value = '';

        modalTitle.textContent = '새 일정 추가';
        saveBtn.textContent = '저장하기';
        deleteBtn.style.display = 'none';
    }
}

saveBtn.addEventListener('click', async () => {
    const title = scheduleTitleInput.value;
    const date = scheduleDateInput.value; 
    const category = scheduleCategoryInput.value;
    
    const rangeEnd = scheduleRangeEndInput ? scheduleRangeEndInput.value : '';
    const repeatType = scheduleRepeatInput.value;
    const repeatEnd = scheduleRepeatEndInput.value;

    if (!title) { alert('제목을 입력해주세요!'); return; }
    if (!currentEditId && repeatType !== 'none' && !repeatEnd) { alert('반복 종료일을 선택해주세요!'); return; }

    saveBtn.textContent = '처리 중...';

    if (currentEditId) {
        await supabaseClient.from('schedules').update({ title, date, category }).eq('id', currentEditId);
    } else {
        const inserts = [];
        const match = date.match(/(\d+)년 (\d+)월 (\d+)일/);
        let targetDate = new Date(match[1], match[2] - 1, match[3]);
        
        let finalEndDate = new Date(targetDate);
        let step = 0; 
        let stepType = 'days';

        // 1. 범위 일정이 설정된 경우 (최우선 처리)
        if (rangeEnd) {
            finalEndDate = new Date(rangeEnd);
            finalEndDate.setHours(23, 59, 59, 999);
            step = 1; 
            stepType = 'days';
        } 
        // 2. 반복 일정이 설정된 경우
        else if (repeatType !== 'none' && repeatEnd) {
            finalEndDate = new Date(repeatEnd);
            finalEndDate.setHours(23, 59, 59, 999);
            if (repeatType === 'daily') { step = 1; stepType = 'days'; }
            if (repeatType === 'weekly') { step = 7; stepType = 'days'; }
            if (repeatType === 'monthly') { step = 1; stepType = 'months'; }
            if (repeatType === 'yearly') { step = 1; stepType = 'years'; }
        }

        while (targetDate <= finalEndDate) {
            const formattedDate = `${targetDate.getFullYear()}년 ${targetDate.getMonth() + 1}월 ${targetDate.getDate()}일`;
            inserts.push({ title, date: formattedDate, category });

            if (step === 0) break; // 일반 일정이면 바로 탈출

            // 날짜 건너뛰기 계산
            if (stepType === 'days') targetDate.setDate(targetDate.getDate() + step);
            else if (stepType === 'months') targetDate.setMonth(targetDate.getMonth() + step);
            else if (stepType === 'years') targetDate.setFullYear(targetDate.getFullYear() + step);
        }
        
        const { error } = await supabaseClient.from('schedules').insert(inserts);
        if(error) alert('일정 저장 중 문제가 발생했습니다.');
    }
    closeAllModals(); 
    loadSchedules();
});

deleteBtn.addEventListener('click', async () => {
    if (!currentEditId) return;
    if (confirm('삭제하시겠습니까?')) {
        deleteBtn.textContent = '삭제 중...';
        await supabaseClient.from('schedules').delete().eq('id', currentEditId);
        closeAllModals(); 
        loadSchedules();
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(console.error); });
}

const themeToggleBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️';
}
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙';
    }
});

loadCategories();