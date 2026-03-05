const monthYearDisplay = document.getElementById('month-year-display');
const daysContainer = document.getElementById('days-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const scheduleModal = document.getElementById('schedule-modal');
const overlay = document.getElementById('overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const scheduleDateInput = document.getElementById('schedule-date');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn'); // 🎯 [NEW] 삭제 버튼 추가
const scheduleTitleInput = document.getElementById('schedule-title');
const scheduleCategoryInput = document.getElementById('schedule-category');
const modalTitle = document.querySelector('.modal-header h3'); // 🎯 [NEW] 모달 제목 변경용

const supabaseUrl = 'https://ezblpefylnxwjleazptf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YmxwZWZ5bG54d2psZWF6cHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTI5NTEsImV4cCI6MjA4NzU2ODk1MX0.i-ee5k9a6fyAivTdXMSLGzKmPAtkvqj9GrZWZf_Z7UM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentDate = new Date();
let schedulesList = [];
let currentEditId = null; // 🎯 [NEW] 현재 수정 중인 일정의 ID를 기억하는 변수

// 🎯 [NEW] 모달 열기 함수 업그레이드 (수정 모드 vs 새 일정 모드)
function openModal(dateString, schedule = null) {
    scheduleDateInput.value = dateString;
    scheduleModal.classList.add('active');
    overlay.classList.add('active');

    if (schedule) {
        // 기존 일정 [수정 모드]
        currentEditId = schedule.id; // 수정할 ID 기억하기
        scheduleTitleInput.value = schedule.title;
        scheduleCategoryInput.value = schedule.category;
        
        modalTitle.textContent = '일정 수정';
        saveBtn.textContent = '수정 완료';
        deleteBtn.style.display = 'block'; // 삭제 버튼 짠! 나타남
    } else {
        // [새 일정 추가 모드]
        currentEditId = null; // 기억 지우기
        scheduleTitleInput.value = '';
        scheduleCategoryInput.value = 'personal';
        
        modalTitle.textContent = '새 일정 추가';
        saveBtn.textContent = '저장하기';
        deleteBtn.style.display = 'none'; // 삭제 버튼 숨김
    }
}

function closeModal() {
    scheduleModal.classList.remove('active');
    overlay.classList.remove('active');
}

async function loadSchedules() {
    const { data, error } = await supabaseClient.from('schedules').select('*');
    if (error) console.error('일정 불러오기 실패:', error);
    else { schedulesList = data; renderCalendar(); }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearDisplay.textContent = `${year}년 ${month + 1}월`;
    daysContainer.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell');
        emptyCell.style.visibility = 'hidden';
        daysContainer.appendChild(emptyCell);
    }

    for (let i = 1; i <= lastDay; i++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day-cell');
        
        const dateNumber = document.createElement('div');
        dateNumber.textContent = i;
        dayCell.appendChild(dateNumber);

        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            dayCell.style.backgroundColor = '#dbeafe';
            dayCell.style.color = '#1e40af';
            dayCell.style.border = '2px solid #bfdbfe';
        }

        const currentCellDate = `${year}년 ${month + 1}월 ${i}일`;
        const todaysSchedules = schedulesList.filter(schedule => schedule.date === currentCellDate);

        todaysSchedules.forEach(schedule => {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.classList.add('schedule-bar');
            scheduleDiv.classList.add(`category-${schedule.category}`);
            scheduleDiv.textContent = schedule.title;

            // 🎯 [NEW] 일정 클릭 시 '수정 모드'로 모달 열기!
            scheduleDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(currentCellDate, schedule); 
            });

            dayCell.appendChild(scheduleDiv);
        });

        // 빈 날짜 클릭 시 '새 일정 추가 모드'로 모달 열기
        dayCell.addEventListener('click', () => {
            openModal(currentCellDate);
        });

        daysContainer.appendChild(dayCell);
    }
}

closeModalBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

// 🎯 [NEW] 저장 버튼 로직 (수정 vs 생성 분기 처리)
saveBtn.addEventListener('click', async () => {
    const title = scheduleTitleInput.value;
    const date = scheduleDateInput.value;
    const category = scheduleCategoryInput.value;

    if (!title) { alert('일정 제목을 입력해주세요!'); return; }

    saveBtn.textContent = '처리 중...';

    if (currentEditId) {
        // [수정하기 - Update]
        const { error } = await supabaseClient
            .from('schedules')
            .update({ title: title, date: date, category: category })
            .eq('id', currentEditId);

        if (error) alert('수정에 실패했습니다.');
        else { closeModal(); loadSchedules(); }
    } else {
        // [새로 만들기 - Insert]
        const { error } = await supabaseClient
            .from('schedules')
            .insert([{ title: title, date: date, category: category }]);

        if (error) alert('저장에 실패했습니다.');
        else { closeModal(); loadSchedules(); }
    }
});

// 🎯 [NEW] 삭제 버튼 로직
deleteBtn.addEventListener('click', async () => {
    if (!currentEditId) return;

    const isDelete = confirm('정말 이 일정을 삭제하시겠습니까?');
    if (isDelete) {
        deleteBtn.textContent = '삭제 중...';
        
        const { error } = await supabaseClient
            .from('schedules')
            .delete()
            .eq('id', currentEditId);

        if (error) {
            alert('삭제에 실패했습니다.');
            deleteBtn.textContent = '삭제하기';
        } else {
            closeModal();
            loadSchedules();
        }
    }
});

loadSchedules();

// 서비스 워커 등록 (PWA 유지)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(console.error);
    });
}