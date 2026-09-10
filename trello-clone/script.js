const STORAGE_KEY = "trello-clone-board";
const LABEL_COLORS = ["#eb5a46", "#f2d600", "#61bd4f", "#0079bf", "#c377e0"];
const columns = document.querySelectorAll(".column");
let draggedCard = null;

function saveState() {
  const state = Array.from(columns).map((column) =>
    Array.from(column.querySelectorAll(".card")).map((card) => ({
      text: card.querySelector(".card-text").textContent,
      color: card.dataset.color,
    }))
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createCard(text, cardList, color = "") {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.color = color;

  card.addEventListener("dragstart", () => {
    draggedCard = card;
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    draggedCard = null;
  });

  const label = document.createElement("div");
  label.className = "card-label";
  label.style.background = color;

  const labelButton = document.createElement("button");
  labelButton.className = "label-btn";
  labelButton.title = "ラベルの色を選択";
  labelButton.addEventListener("click", (event) => {
    event.stopPropagation();
    palette.classList.toggle("open");
  });

  const labelPreview = document.createElement("span");
  labelPreview.className = "label-btn-swatch";
  labelButton.appendChild(labelPreview);

  function setColor(newColor) {
    card.dataset.color = newColor;
    label.style.background = newColor;
    labelPreview.style.background = newColor;
    labelPreview.classList.toggle("empty", newColor === "");
    palette.classList.remove("open");
    saveState();
  }

  const palette = document.createElement("div");
  palette.className = "card-palette";

  const clearSwatch = document.createElement("button");
  clearSwatch.className = "swatch swatch-clear";
  clearSwatch.title = "ラベルなし";
  clearSwatch.addEventListener("click", () => setColor(""));
  palette.appendChild(clearSwatch);

  LABEL_COLORS.forEach((swatchColor) => {
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.style.background = swatchColor;
    swatch.addEventListener("click", () => setColor(swatchColor));
    palette.appendChild(swatch);
  });

  labelPreview.style.background = color;
  labelPreview.classList.toggle("empty", color === "");

  document.addEventListener("click", () => {
    palette.classList.remove("open");
  });

  const content = document.createElement("div");
  content.className = "card-content";

  const cardText = document.createElement("span");
  cardText.className = "card-text";
  cardText.textContent = text;
  cardText.title = "ダブルクリックで編集";

  cardText.addEventListener("dblclick", () => {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "card-edit-input";
    editInput.value = cardText.textContent;

    card.draggable = false;
    content.replaceChild(editInput, cardText);
    editInput.focus();
    editInput.select();

    function finishEdit(save) {
      if (save) {
        const newText = editInput.value.trim();
        if (newText !== "") cardText.textContent = newText;
      }
      content.replaceChild(cardText, editInput);
      card.draggable = true;
      if (save) saveState();
    }

    editInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") finishEdit(true);
      if (event.key === "Escape") finishEdit(false);
    });

    editInput.addEventListener("blur", () => finishEdit(true));
  });

  const moveButton = document.createElement("button");
  moveButton.className = "move-btn";
  moveButton.textContent = "→";
  moveButton.addEventListener("click", () => {
    const currentColumn = card.closest(".column");
    const nextColumn = currentColumn.nextElementSibling;
    if (nextColumn) {
      nextColumn.querySelector(".card-list").appendChild(card);
      saveState();
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "×";
  deleteButton.addEventListener("click", () => {
    card.remove();
    saveState();
  });

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.appendChild(labelButton);
  actions.appendChild(moveButton);
  actions.appendChild(deleteButton);

  content.appendChild(cardText);
  content.appendChild(actions);

  const body = document.createElement("div");
  body.className = "card-body";
  body.appendChild(palette);
  body.appendChild(content);

  card.appendChild(label);
  card.appendChild(body);
  cardList.appendChild(card);
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const state = JSON.parse(saved);
  state.forEach((cards, index) => {
    const cardList = columns[index].querySelector(".card-list");
    cards.forEach(({ text, color }) => createCard(text, cardList, color));
  });
}

columns.forEach((column) => {
  const input = column.querySelector(".card-input");
  const button = column.querySelector(".add-btn");
  const cardList = column.querySelector(".card-list");

  function addCard() {
    const text = input.value.trim();
    if (text === "") return;

    createCard(text, cardList);
    saveState();

    input.value = "";
    input.focus();
  }

  button.addEventListener("click", addCard);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addCard();
  });

  cardList.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  cardList.addEventListener("drop", () => {
    if (draggedCard) {
      cardList.appendChild(draggedCard);
      saveState();
    }
  });
});

loadState();
