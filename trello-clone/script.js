const board = document.getElementById('board');

const PRIORITIES = ['高', '中', '低'];
const PRIORITY_RANK = { 高: 1, 中: 2, 低: 3 };

const state = {
  lists: [
    { id: 'todo', title: '未着手', cards: [
      { id: 1, title: 'カード1', dueDate: null, priority: null },
      { id: 2, title: 'カード2', dueDate: null, priority: null },
    ] },
    { id: 'doing', title: '進行中', cards: [
      { id: 3, title: 'カード3', dueDate: null, priority: null },
    ] },
    { id: 'done', title: '完了', cards: [
      { id: 4, title: 'カード4', dueDate: null, priority: null },
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
    moveCardTo(draggingCardId, listIndex, null);
  });

  const header = document.createElement('div');
  header.className = 'column-header';

  const heading = document.createElement('h2');
  heading.textContent = list.title;
  header.appendChild(heading);

  const sortActions = document.createElement('div');
  sortActions.className = 'sort-actions';

  const sortByPriorityBtn = document.createElement('button');
  sortByPriorityBtn.className = 'sort-btn';
  sortByPriorityBtn.textContent = '優先度順';
  sortByPriorityBtn.addEventListener('click', () => {
    list.cards.sort((a, b) => (PRIORITY_RANK[a.priority] || 4) - (PRIORITY_RANK[b.priority] || 4));
    render();
  });
  sortActions.appendChild(sortByPriorityBtn);

  const sortByDueDateBtn = document.createElement('button');
  sortByDueDateBtn.className = 'sort-btn';
  sortByDueDateBtn.textContent = '期限順';
  sortByDueDateBtn.addEventListener('click', () => {
    list.cards.sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
    render();
  });
  sortActions.appendChild(sortByDueDateBtn);

  header.appendChild(sortActions);
  column.appendChild(header);

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

  list.cards.forEach((card) => {
    column.appendChild(renderCard(card, list, listIndex));
  });

  return column;
}

function createPriorityInput(selectedValue) {
  const select = document.createElement('select');
  select.className = 'inline-input';

  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '優先度未設定';
  select.appendChild(emptyOption);

  PRIORITIES.forEach((p) => {
    const option = document.createElement('option');
    option.value = p;
    option.textContent = p;
    select.appendChild(option);
  });

  select.value = selectedValue || '';
  return select;
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

  const priorityInput = createPriorityInput('');

  const confirmAdd = () => {
    const title = titleInput.value.trim();
    if (title) {
      list.cards.push({
        id: nextCardId++,
        title,
        dueDate: dateInput.value || null,
        priority: priorityInput.value || null,
      });
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
  wrapper.appendChild(priorityInput);
  wrapper.appendChild(actions);

  requestAnimationFrame(() => titleInput.focus());

  return wrapper;
}

function renderCard(card, list, listIndex) {
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
  cardEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  cardEl.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingCardId === card.id) return;

    const rect = cardEl.getBoundingClientRect();
    const droppedAfter = e.clientY - rect.top > rect.height / 2;

    let insertBeforeCardId;
    if (droppedAfter) {
      const currentIndex = list.cards.findIndex((c) => c.id === card.id);
      const nextCard = list.cards[currentIndex + 1];
      insertBeforeCardId = nextCard ? nextCard.id : null;
    } else {
      insertBeforeCardId = card.id;
    }

    moveCardTo(draggingCardId, listIndex, insertBeforeCardId);
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
    due.className = 'card-meta';
    due.textContent = `期限: ${card.dueDate}`;
    cardEl.appendChild(due);
  }

  if (card.priority) {
    const priority = document.createElement('p');
    priority.className = 'card-meta';
    priority.textContent = `優先度: ${card.priority}`;
    cardEl.appendChild(priority);
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

  const priorityInput = createPriorityInput(card.priority);

  const confirmEdit = () => {
    const title = titleInput.value.trim();
    if (title) {
      card.title = title;
      card.dueDate = dateInput.value || null;
      card.priority = priorityInput.value || null;
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
  wrapper.appendChild(priorityInput);
  wrapper.appendChild(actions);

  requestAnimationFrame(() => {
    titleInput.focus();
    titleInput.select();
  });

  return wrapper;
}

function moveCardTo(cardId, toListIndex, insertBeforeCardId) {
  if (cardId == null) return;

  let card = null;
  let fromListIndex = -1;
  state.lists.forEach((list, idx) => {
    const found = list.cards.find((c) => c.id === cardId);
    if (found) {
      card = found;
      fromListIndex = idx;
    }
  });
  if (!card) return;

  state.lists[fromListIndex].cards = state.lists[fromListIndex].cards.filter((c) => c.id !== cardId);

  const destCards = state.lists[toListIndex].cards;
  if (insertBeforeCardId == null) {
    destCards.push(card);
  } else {
    const insertIndex = destCards.findIndex((c) => c.id === insertBeforeCardId);
    if (insertIndex === -1) {
      destCards.push(card);
    } else {
      destCards.splice(insertIndex, 0, card);
    }
  }
  render();
}

render();
