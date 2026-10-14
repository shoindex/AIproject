const board = document.getElementById('board');

const state = {
  lists: [
    { id: 'todo', title: '未着手', cards: [
      { id: 1, title: 'カード1', dueDate: null },
      { id: 2, title: 'カード2', dueDate: null },
    ] },
    { id: 'doing', title: '進行中', cards: [
      { id: 3, title: 'カード3', dueDate: null },
    ] },
    { id: 'done', title: '完了', cards: [
      { id: 4, title: 'カード4', dueDate: null },
    ] },
  ],
};

let nextCardId = 5;
let addingListId = null;
let editingCardId = null;
let draggingCardId = null;

function render() {
  board.innerHTML = '';
  state.lists.forEach((list, listIndex) => {
    board.appendChild(renderColumn(list, listIndex));
  });
}

function renderColumn(list, listIndex) {
  const column = document.createElement('section');
  column.className = 'column';

  column.addEventListener('dragover', (e) => {
    e.preventDefault();
    column.classList.add('drag-over');
  });
  column.addEventListener('dragleave', () => {
    column.classList.remove('drag-over');
  });
  column.addEventListener('drop', (e) => {
    e.preventDefault();
    column.classList.remove('drag-over');
    moveCardById(draggingCardId, listIndex);
  });

  const heading = document.createElement('h2');
  heading.textContent = list.title;
  column.appendChild(heading);

  if (addingListId === list.id) {
    column.appendChild(createAddCardForm(list));
  } else {
    const addBtn = document.createElement('button');
    addBtn.className = 'add-card-btn';
    addBtn.textContent = '＋ カード追加';
    addBtn.addEventListener('click', () => {
      addingListId = list.id;
      render();
    });
    column.appendChild(addBtn);
  }

  sortCardsByDueDate(list.cards).forEach((card) => {
    column.appendChild(renderCard(card, list));
  });

  return column;
}

function sortCardsByDueDate(cards) {
  return [...cards].sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

function createAddCardForm(list) {
  const wrapper = document.createElement('div');

  const titleInput = document.createElement('input');
  titleInput.className = 'inline-input';
  titleInput.type = 'text';
  titleInput.placeholder = 'カードのタイトル';

  const dateInput = document.createElement('input');
  dateInput.className = 'inline-input';
  dateInput.type = 'date';

  const confirmAdd = () => {
    const title = titleInput.value.trim();
    if (title) {
      list.cards.push({ id: nextCardId++, title, dueDate: dateInput.value || null });
    }
    addingListId = null;
    render();
  };

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const addBtn = document.createElement('button');
  addBtn.textContent = '追加';
  addBtn.addEventListener('click', confirmAdd);
  actions.appendChild(addBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'キャンセル';
  cancelBtn.addEventListener('click', () => {
    addingListId = null;
    render();
  });
  actions.appendChild(cancelBtn);

  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmAdd();
  });

  wrapper.appendChild(titleInput);
  wrapper.appendChild(dateInput);
  wrapper.appendChild(actions);

  requestAnimationFrame(() => titleInput.focus());

  return wrapper;
}

function renderCard(card, list) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  cardEl.draggable = true;

  cardEl.addEventListener('dragstart', (e) => {
    draggingCardId = card.id;
    e.dataTransfer.setData('text/plain', String(card.id));
    e.dataTransfer.effectAllowed = 'move';
    cardEl.classList.add('dragging');
  });
  cardEl.addEventListener('dragend', () => {
    cardEl.classList.remove('dragging');
    draggingCardId = null;
  });

  if (editingCardId === card.id) {
    cardEl.appendChild(createEditForm(card));
    return cardEl;
  }

  const title = document.createElement('p');
  title.className = 'card-title';
  title.textContent = card.title;
  title.addEventListener('click', () => {
    editingCardId = card.id;
    render();
  });
  cardEl.appendChild(title);

  if (card.dueDate) {
    const due = document.createElement('p');
    due.className = 'card-due';
    due.textContent = `期限: ${card.dueDate}`;
    cardEl.appendChild(due);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'edit';
  editBtn.textContent = '編集';
  editBtn.addEventListener('click', () => {
    editingCardId = card.id;
    render();
  });
  actions.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete';
  deleteBtn.textContent = '削除';
  deleteBtn.addEventListener('click', () => {
    list.cards = list.cards.filter((c) => c.id !== card.id);
    render();
  });
  actions.appendChild(deleteBtn);

  cardEl.appendChild(actions);
  return cardEl;
}

function createEditForm(card) {
  const wrapper = document.createElement('div');

  const titleInput = document.createElement('input');
  titleInput.className = 'inline-input';
  titleInput.type = 'text';
  titleInput.value = card.title;

  const dateInput = document.createElement('input');
  dateInput.className = 'inline-input';
  dateInput.type = 'date';
  dateInput.value = card.dueDate || '';

  const confirmEdit = () => {
    const title = titleInput.value.trim();
    if (title) {
      card.title = title;
      card.dueDate = dateInput.value || null;
    }
    editingCardId = null;
    render();
  };

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '保存';
  saveBtn.addEventListener('click', confirmEdit);
  actions.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'キャンセル';
  cancelBtn.addEventListener('click', () => {
    editingCardId = null;
    render();
  });
  actions.appendChild(cancelBtn);

  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmEdit();
  });

  wrapper.appendChild(titleInput);
  wrapper.appendChild(dateInput);
  wrapper.appendChild(actions);

  requestAnimationFrame(() => {
    titleInput.focus();
    titleInput.select();
  });

  return wrapper;
}

function moveCardById(cardId, toIndex) {
  if (cardId == null) return;
  let card = null;
  let fromList = null;
  for (const list of state.lists) {
    const found = list.cards.find((c) => c.id === cardId);
    if (found) {
      card = found;
      fromList = list;
      break;
    }
  }
  if (!card || fromList === state.lists[toIndex]) return;
  fromList.cards = fromList.cards.filter((c) => c.id !== cardId);
  state.lists[toIndex].cards.push(card);
  render();
}

render();
