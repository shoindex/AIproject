const board = document.getElementById('board');

const state = {
  lists: [
    { id: 'todo', title: '未着手', cards: [
      { id: 1, title: 'カード1' },
      { id: 2, title: 'カード2' },
    ] },
    { id: 'doing', title: '進行中', cards: [
      { id: 3, title: 'カード3' },
    ] },
    { id: 'done', title: '完了', cards: [
      { id: 4, title: 'カード4' },
    ] },
  ],
};

let nextCardId = 5;
let addingListId = null;
let editingCardId = null;

function render() {
  board.innerHTML = '';
  state.lists.forEach((list, listIndex) => {
    board.appendChild(renderColumn(list, listIndex));
  });
}

function renderColumn(list, listIndex) {
  const column = document.createElement('section');
  column.className = 'column';

  const heading = document.createElement('h2');
  heading.textContent = list.title;
  column.appendChild(heading);

  if (addingListId === list.id) {
    column.appendChild(createAddCardInput(list));
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

function createAddCardInput(list) {
  const input = document.createElement('input');
  input.className = 'inline-input';
  input.type = 'text';
  input.placeholder = 'カードのタイトル';

  const confirmAdd = () => {
    const title = input.value.trim();
    if (title) {
      list.cards.push({ id: nextCardId++, title });
    }
    addingListId = null;
    render();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmAdd();
  });
  input.addEventListener('blur', confirmAdd);

  requestAnimationFrame(() => input.focus());

  return input;
}

function renderCard(card, list, listIndex) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';

  if (editingCardId === card.id) {
    cardEl.appendChild(createEditInput(card));
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

  if (listIndex > 0) {
    const leftList = state.lists[listIndex - 1];
    const leftBtn = document.createElement('button');
    leftBtn.textContent = `← ${leftList.title}`;
    leftBtn.addEventListener('click', () => moveCard(card, list, listIndex - 1));
    actions.appendChild(leftBtn);
  }

  if (listIndex < state.lists.length - 1) {
    const rightList = state.lists[listIndex + 1];
    const rightBtn = document.createElement('button');
    rightBtn.textContent = `→ ${rightList.title}`;
    rightBtn.addEventListener('click', () => moveCard(card, list, listIndex + 1));
    actions.appendChild(rightBtn);
  }

  cardEl.appendChild(actions);
  return cardEl;
}

function createEditInput(card) {
  const input = document.createElement('input');
  input.className = 'inline-input';
  input.type = 'text';
  input.value = card.title;

  const confirmEdit = () => {
    const title = input.value.trim();
    if (title) {
      card.title = title;
    }
    editingCardId = null;
    render();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmEdit();
  });
  input.addEventListener('blur', confirmEdit);

  requestAnimationFrame(() => {
    input.focus();
    input.select();
  });

  return input;
}

function moveCard(card, fromList, toIndex) {
  fromList.cards = fromList.cards.filter((c) => c.id !== card.id);
  state.lists[toIndex].cards.push(card);
  render();
}

render();
