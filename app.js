// ==========================================
// 🎯 투두리스트 전용 사이드바 버튼 연결
// ==========================================
const todoSidebarBtn = document.getElementById('todo-sidebar-btn');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');

if (todoSidebarBtn) {
    todoSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });
}
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

// ==========================================
// 🌌 The Archive 바로가기 연결
// ==========================================
const archiveLinkBtn = document.getElementById('archive-link-btn');

if (archiveLinkBtn) {
    archiveLinkBtn.addEventListener('click', () => {
        // 사이드바를 살포시 닫아주고
        closeSidebar(); 
        
        // 플래너가 꺼지지 않게 '새 탭(_blank)'으로 The Archive 열기!
        window.open('https://akffkdgoawwl.vercel.app/', '_blank'); 
    });
}

// ==========================================
// 공통 변수 및 UI 요소
// ==========================================
const monthYearDisplay = document.getElementById('month-year-display');
const daysContainer = document.getElementById('days-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const viewToggleBtn = document.getElementById('view-toggle-btn');

const scheduleModal = document.getElementById('schedule-modal');
const categoryModal = document.getElementById('category-modal');
const rangeModal = document.getElementById('range-modal'); 
const overlay = document.getElementById('overlay');

const closeModalBtn = document.getElementById('close-modal-btn');
const closeCategoryBtn = document.getElementById('close-category-btn');
const closeRangeBtn = document.getElementById('close-range-btn'); 

const scheduleDateInput = document.getElementById('schedule-date');
const scheduleRangeEndInput = document.getElementById('schedule-range-end');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');
const scheduleTitleInput = document.getElementById('schedule-title');
const scheduleCategoryInput = document.getElementById('schedule-category');
const modalTitle = document.querySelector('#schedule-modal .modal-header h3');

const repeatUiGroup = document.getElementById('repeat-ui-group');
const scheduleRepeatInput = document.getElementById('schedule-repeat');
const repeatEndContainer = document.getElementById('repeat-end-container');
const scheduleRepeatEndInput = document.getElementById('schedule-repeat-end');

const manageCategoryBtn = document.getElementById('manage-category-btn');
const manageRangeBtn = document.getElementById('manage-range-btn'); 
const categoryListUl = document.getElementById('category-list');
const rangeListUl = document.getElementById('range-list'); 

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
let currentEditGroupId = null; 
let isWeeklyView = false;

viewToggleBtn.addEventListener('click', () => {
    isWeeklyView = !isWeeklyView;
    viewToggleBtn.textContent = isWeeklyView ? '🗓️ 월간 보기' : '📆 주간 보기';
    document.querySelector('.calendar-wrapper').classList.toggle('weekly-mode', isWeeklyView);
    renderCalendar();
    closeSidebar();
});

function closeAllModals() {
    scheduleModal.classList.remove('active');
    categoryModal.classList.remove('active');
    rangeModal.classList.remove('active');
    overlay.classList.remove('active');
    currentEditGroupId = null; 
}
closeModalBtn.addEventListener('click', closeAllModals);
closeCategoryBtn.addEventListener('click', closeAllModals);
closeRangeBtn.addEventListener('click', closeAllModals);
overlay.addEventListener('click', closeAllModals);

scheduleRepeatInput.addEventListener('change', (e) => {
    repeatEndContainer.style.display = e.target.value === 'none' ? 'none' : 'block';
});

// ==========================================
// 🏷️ 카테고리 로직
// ==========================================
manageCategoryBtn.addEventListener('click', () => {
    closeSidebar();
    categoryModal.classList.add('active');
    overlay.classList.add('active');
});

async function loadCategories() {
    const { data, error } = await supabaseClient.from('categories').select('*').order('sort_order', { ascending: true });
    
    if (!error) {
        categoriesList = data;
        renderCategoryManager();
        updateCategoryDropdown();
    }
    loadSchedules(); 
}

function renderCategoryManager() {
    categoryListUl.innerHTML = '';
    categoriesList.forEach((cat, index) => {
        const li = document.createElement('li');
        li.className = 'category-item';
        
        li.innerHTML = `
            <div class="category-info">
                <div class="category-color-dot" style="background-color: ${cat.color}"></div>
                <span>${cat.name}</span>
            </div>
            <div style="display:flex; gap: 8px; align-items:center;">
                <button class="move-up-btn" data-index="${index}" style="background:none; border:none; cursor:pointer; font-size: 16px; color:#888;">▲</button>
                <button class="move-down-btn" data-index="${index}" style="background:none; border:none; cursor:pointer; font-size: 16px; color:#888;">▼</button>
                <button class="delete-cat-btn" data-id="${cat.id}">삭제</button>
            </div>
        `;
        categoryListUl.appendChild(li);
    });

    document.querySelectorAll('.move-up-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (index > 0) {
                const temp = categoriesList[index];
                categoriesList[index] = categoriesList[index - 1];
                categoriesList[index - 1] = temp;

                const updates = categoriesList.map((cat, i) => 
                    supabaseClient.from('categories').update({ sort_order: i }).eq('id', cat.id)
                );
                await Promise.all(updates);
                loadCategories();
            }
        });
    });

    document.querySelectorAll('.move-down-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (index < categoriesList.length - 1) {
                const temp = categoriesList[index];
                categoriesList[index] = categoriesList[index + 1];
                categoriesList[index + 1] = temp;

                const updates = categoriesList.map((cat, i) => 
                    supabaseClient.from('categories').update({ sort_order: i }).eq('id', cat.id)
                );
                await Promise.all(updates);
                loadCategories();
            }
        });
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
    const newSortOrder = categoriesList.length; 
    
    await supabaseClient.from('categories').insert([{ name, color, sort_order: newSortOrder }]);
    newCategoryName.value = ''; 
    loadCategories();
    addCategoryBtn.textContent = '추가하기';
});

// ==========================================
// 📅 달력 및 범위 일정 렌더링 로직
// ==========================================
async function loadSchedules() {
    const { data, error } = await supabaseClient.from('schedules').select('*');
    if (!error) { schedulesList = data; }
    renderCalendar(); 
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

manageRangeBtn.addEventListener('click', () => {
    closeSidebar();
    rangeModal.classList.add('active');
    overlay.classList.add('active');
    renderRangeManager();
});

function renderRangeManager() {
    rangeListUl.innerHTML = '';
    const groups = {};
    schedulesList.forEach(s => {
        if (s.group_id) {
            if (!groups[s.group_id]) groups[s.group_id] = [];
            groups[s.group_id].push(s);
        }
    });

    Object.keys(groups).forEach(groupId => {
        const groupSchedules = groups[groupId];
        groupSchedules.sort((a,b) => {
            const parseDate = (d) => {
                const m = d.match(/(\d+)년 (\d+)월 (\d+)일/);
                return new Date(m[1], m[2]-1, m[3]).getTime();
            };
            return parseDate(a.date) - parseDate(b.date);
        });

        const start = groupSchedules[0].date;
        const end = groupSchedules[groupSchedules.length-1].date;
        const title = groupSchedules[0].title;

        const li = document.createElement('li');
        li.className = 'category-item'; 
        li.innerHTML = `
            <div class="category-info" style="flex-direction: column; align-items: flex-start; gap: 5px;">
                <span style="font-weight: bold; color: inherit;">${title}</span>
                <span style="font-size: 12px; color: #888;">${start} ~ ${end} (${groupSchedules.length}개)</span>
            </div>
            <div style="display:flex; gap: 5px;">
                <button class="edit-group-btn" data-id="${groupId}" style="background-color: #4f46e5; color: white; border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-size: 12px;">수정</button>
                <button class="delete-group-btn" data-id="${groupId}" style="background-color: #ff3b30; color: white; border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-size: 12px;">삭제</button>
            </div>
        `;
        rangeListUl.appendChild(li);
    });

    document.querySelectorAll('.edit-group-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groupId = e.target.getAttribute('data-id');
            const groupSchedules = groups[groupId];
            
            rangeModal.classList.remove('active'); 
            scheduleModal.classList.add('active'); 
            
            scheduleTitleInput.value = groupSchedules[0].title;
            scheduleCategoryInput.value = groupSchedules[0].category;
            scheduleDateInput.value = groupSchedules[0].date; 
            
            const lastDate = groupSchedules[groupSchedules.length-1].date;
            const m = lastDate.match(/(\d+)년 (\d+)월 (\d+)일/);
            const formattedEnd = `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
            
            // 🎯 범위 일정 그룹 통째로 수정 시 입력칸과 글씨 모두 다시 보이기!
            scheduleRangeEndInput.value = formattedEnd;
            scheduleRangeEndInput.style.display = 'block';
            const rangeEndLabel = scheduleRangeEndInput.previousElementSibling;
            if(rangeEndLabel) rangeEndLabel.style.display = 'block';

            repeatUiGroup.style.display = 'none';
            scheduleRepeatInput.value = 'none';

            modalTitle.textContent = '범위 일정 [그룹 수정]';
            saveBtn.textContent = '수정 적용하기';
            deleteBtn.style.display = 'none';

            currentEditId = null; 
            currentEditGroupId = groupId; 
        });
    });

    document.querySelectorAll('.delete-group-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const groupId = e.target.getAttribute('data-id');
            if (confirm('이 범위로 묶인 일정들을 모두 삭제하시겠습니까?')) {
                await supabaseClient.from('schedules').delete().eq('group_id', groupId);
                loadSchedules();
                renderRangeManager(); 
            }
        });
    });
}

// ==========================================
// 🎯 일정 저장 및 삭제 (라벨 숨김 완벽 적용)
// ==========================================
function openModal(dateString, schedule = null) {
    scheduleDateInput.value = dateString;
    scheduleModal.classList.add('active');
    overlay.classList.add('active');
    currentEditGroupId = null; 
    deleteBtn.textContent = '삭제하기'; 

    // 🎯 종료일 글씨(라벨) 찾아내기
    const rangeEndLabel = scheduleRangeEndInput ? scheduleRangeEndInput.previousElementSibling : null;

    if (schedule) {
        currentEditId = schedule.id;
        scheduleTitleInput.value = schedule.title;
        scheduleCategoryInput.value = schedule.category;
        
        // 🎯 개별 일정 수정 시 입력칸 + 글씨 모두 완벽하게 숨김!
        if(scheduleRangeEndInput) {
            scheduleRangeEndInput.style.display = 'none';
            if(rangeEndLabel) rangeEndLabel.style.display = 'none'; 
        }
        if(repeatUiGroup) repeatUiGroup.style.display = 'none';

        modalTitle.textContent = '개별 일정 수정';
        saveBtn.textContent = '수정 완료';
        deleteBtn.style.display = 'block';
    } else {
        currentEditId = null;
        scheduleTitleInput.value = '';
        if(categoriesList.length > 0) scheduleCategoryInput.value = categoriesList[0].name; 
        
        // 🎯 새 일정 추가 시 입력칸 + 글씨 모두 다시 보임!
        if(scheduleRangeEndInput) {
            scheduleRangeEndInput.style.display = 'block';
            if(rangeEndLabel) rangeEndLabel.style.display = 'block';
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

    saveBtn.textContent = '처리 중...';

    if (currentEditGroupId) {
        await supabaseClient.from('schedules').delete().eq('group_id', currentEditGroupId);
    }

    if (currentEditId && !currentEditGroupId) {
        await supabaseClient.from('schedules').update({ title, date, category }).eq('id', currentEditId);
    } else {
        const inserts = [];
        const match = date.match(/(\d+)년 (\d+)월 (\d+)일/);
        let targetDate = new Date(match[1], match[2] - 1, match[3]);
        
        let finalEndDate = new Date(targetDate);
        let step = 0; 
        let stepType = 'days';

        if (rangeEnd) {
            finalEndDate = new Date(rangeEnd);
            finalEndDate.setHours(23, 59, 59, 999);
            step = 1; stepType = 'days';
        } else if (repeatType !== 'none' && repeatEnd) {
            finalEndDate = new Date(repeatEnd);
            finalEndDate.setHours(23, 59, 59, 999);
            if (repeatType === 'daily') { step = 1; stepType = 'days'; }
            if (repeatType === 'weekly') { step = 7; stepType = 'days'; }
            if (repeatType === 'monthly') { step = 1; stepType = 'months'; }
            if (repeatType === 'yearly') { step = 1; stepType = 'years'; }
        }

        const isGroup = step > 0 || currentEditGroupId;
        const groupIdToUse = currentEditGroupId || (isGroup ? 'group_' + Date.now() : null);

        while (targetDate <= finalEndDate) {
            const formattedDate = `${targetDate.getFullYear()}년 ${targetDate.getMonth() + 1}월 ${targetDate.getDate()}일`;
            inserts.push({ 
                title, 
                date: formattedDate, 
                category,
                ...(groupIdToUse && { group_id: groupIdToUse })
            });

            if (step === 0) break;

            if (stepType === 'days') targetDate.setDate(targetDate.getDate() + step);
            else if (stepType === 'months') targetDate.setMonth(targetDate.getMonth() + step);
            else if (stepType === 'years') targetDate.setFullYear(targetDate.getFullYear() + step);
        }
        
        const { error } = await supabaseClient.from('schedules').insert(inserts);
        if(error) alert('일정 저장 중 문제가 발생했습니다.');
    }
    
    currentEditGroupId = null; 
    closeAllModals(); 
    loadSchedules();
});

deleteBtn.addEventListener('click', async () => {
    if (!currentEditId) return;
    if (confirm('이 개별 일정 하나만 삭제하시겠습니까?')) {
        deleteBtn.textContent = '삭제 중...';
        await supabaseClient.from('schedules').delete().eq('id', currentEditId);
        closeAllModals(); 
        loadSchedules();
    }
});

// 다크모드
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

// ==========================================
// 📝 투두리스트 (할 일) 및 사이드바 제어 로직
// ==========================================
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoListUl = document.getElementById('todo-list');

const todoMenuBtn = document.getElementById('todo-menu-btn');
const todoSubmenu = document.getElementById('todo-submenu');
const todoMenuArrow = document.getElementById('todo-menu-arrow');
const mainScreenBtn = document.getElementById('main-screen-btn'); 
const calendarWrapper = document.querySelector('.calendar-wrapper'); 

let todosList = [];
let currentTodoFilter = 'main'; 

if(mainScreenBtn) {
    mainScreenBtn.addEventListener('click', () => {
        calendarWrapper.classList.remove('hidden-section'); 
        currentTodoFilter = 'main'; 
        renderTodos();
        closeSidebar();
    });
}

if(todoMenuBtn) {
    todoMenuBtn.addEventListener('click', () => {
        todoSubmenu.classList.toggle('active');
        todoMenuArrow.textContent = todoSubmenu.classList.contains('active') ? '▲' : '▼';
    });
}

document.querySelectorAll('.submenu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentTodoFilter = e.target.getAttribute('data-filter'); 
        calendarWrapper.classList.add('hidden-section');
        renderTodos(); 
        closeSidebar(); 
    });
});

async function loadTodos() {
    const { data, error } = await supabaseClient.from('todos').select('*').order('id', { ascending: true });
    if (!error) {
        todosList = data;
        renderTodos();
    }
}

// ==========================================
// 2. 화면에 투두리스트 그리기 (서버 저장 완벽 대기 로직 추가 🚀)
// ==========================================
function renderTodos() {
    todoListUl.innerHTML = '';
    
    const filteredTodos = todosList.filter(todo => {
        if (currentTodoFilter === 'active' || currentTodoFilter === 'main') return !todo.is_completed;
        if (currentTodoFilter === 'completed') return todo.is_completed;
        return true; 
    });

    if (filteredTodos.length === 0) {
        const li = document.createElement('li');
        li.style.padding = '15px';
        li.style.textAlign = 'center';
        li.style.color = '#888';
        li.textContent = '해당하는 할 일이 없습니다.';
        todoListUl.appendChild(li);
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.is_completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.is_completed ? 'checked' : ''}>
                <span class="todo-text">${todo.task}</span>
            </div>
            <button class="todo-delete-btn" data-id="${todo.id}">🗑️</button>
        `;
        todoListUl.appendChild(li);
    });

    // 🎯 체크박스 이벤트 (안전장치 탑재)
    document.querySelectorAll('.todo-checkbox').forEach(box => {
        box.addEventListener('change', async (e) => { // 👈 async 추가됨!
            const id = e.target.getAttribute('data-id');
            const is_completed = e.target.checked;
            const liElement = e.target.closest('.todo-item');

            // 1. 서버에 진짜로 저장이 완료될 때까지 기다리기 (await 추가)
            const { error } = await supabaseClient.from('todos').update({ is_completed }).eq('id', id);
            
            // 만약 Supabase에서 에러를 뱉어내면 (예: RLS 권한 문제 등)
            if (error) {
                alert('저장 실패! Supabase에서 todos 표의 RLS(보안)가 꺼져있는지 확인해주세요.');
                console.error(error);
                e.target.checked = !is_completed; // 화면의 체크박스도 원래대로 강제 복구!
                return;
            }
            
            // 2. 서버 저장이 성공적으로 끝난 뒤에만 로컬 메모리 업데이트!
            const targetTodo = todosList.find(t => t.id == id);
            if(targetTodo) targetTodo.is_completed = is_completed;

            // 3. 그리고 나서 안심하고 페이드아웃 애니메이션 실행
            if (((currentTodoFilter === 'active' || currentTodoFilter === 'main') && is_completed) || 
                (currentTodoFilter === 'completed' && !is_completed)) {
                
                liElement.classList.add('fade-out-item'); 
                setTimeout(() => { renderTodos(); }, 300); 
            } else {
                if(is_completed) liElement.classList.add('completed');
                else liElement.classList.remove('completed');
            }
        });
    });

    // 🎯 삭제 이벤트 (휴지통도 안전장치 탑재)
    document.querySelectorAll('.todo-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => { // 👈 async 추가됨!
            const id = e.target.getAttribute('data-id');
            const liElement = e.target.closest('.todo-item');
            
            // 삭제 역시 서버에서 완전히 지워질 때까지 기다림
            const { error } = await supabaseClient.from('todos').delete().eq('id', id);
            
            if (error) {
                alert('삭제 실패! 인터넷 연결이나 RLS 설정을 확인해주세요.');
                return;
            }

            liElement.classList.add('fade-out-item'); 
            todosList = todosList.filter(t => t.id != id); 
            
            setTimeout(() => { renderTodos(); }, 300); 
        });
    });
}

addTodoBtn.addEventListener('click', async () => {
    const task = todoInput.value.trim();
    if (!task) return alert('할 일을 입력하세요!');
    
    addTodoBtn.textContent = '...';
    const { error } = await supabaseClient.from('todos').insert([{ task, is_completed: false }]);
    
    if (error) alert('투두 추가 실패!');
    else {
        todoInput.value = '';
        loadTodos();
    }
    addTodoBtn.textContent = '추가';
});

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodoBtn.click();
});

// PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(console.error); });
}

// ==========================================
// 📌 퀵 메모 (Floating Sticky Note) 로직
// ==========================================
const quickMemoBtn = document.getElementById('quick-memo-btn');
const quickMemoContainer = document.getElementById('quick-memo-container');
const closeMemoBtn = document.getElementById('close-memo-btn');
const quickMemoText = document.getElementById('quick-memo-text');

// 1. 메모장 열기/닫기 토글 애니메이션
if (quickMemoBtn && quickMemoContainer) {
    quickMemoBtn.addEventListener('click', () => {
        quickMemoContainer.classList.toggle('quick-memo-hidden');
        
        // 창이 열리면 바로 타자를 칠 수 있게 커서를 자동으로 깜빡이게 해줌 (디테일!)
        if (!quickMemoContainer.classList.contains('quick-memo-hidden')) {
            setTimeout(() => { quickMemoText.focus(); }, 100); 
        }
    });
}

// 2. 닫기(X) 버튼 누르면 닫히기
if (closeMemoBtn) {
    closeMemoBtn.addEventListener('click', () => {
        quickMemoContainer.classList.add('quick-memo-hidden');
    });
}

// 3. 브라우저 로컬 저장소(localStorage)를 활용한 초고속 자동 저장!
if (quickMemoText) {
    // 앱을 처음 켰을 때, 내 브라우저에 저장되어 있던 메모를 싹 불러옴
    const savedMemo = localStorage.getItem('quickMemoData');
    if (savedMemo) {
        quickMemoText.value = savedMemo;
    }

    // 키보드를 하나 칠 때마다(input 이벤트) 0.001초 만에 자동 저장!
    quickMemoText.addEventListener('input', (e) => {
        localStorage.setItem('quickMemoData', e.target.value);
    });
}

// 🚀 앱 최초 실행
loadCategories();
loadTodos();

