import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";
// @todo: подключение

// Исходные данные используемые в render()
// const {data, ...indexes} = initData(sourceData);

//СДЕЛАЛИ ПРИСВОЕНИЕ
const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));
  const rowsPerPage = parseInt(state.rowsPerPage); // приведём количество страниц к числу
  const page = parseInt(state.page ?? 1); // номер страницы по умолчанию 1 и тоже число
  const total = [parseFloat(state.totalFrom), parseFloat(state.totalTo)];
  return {
    // расширьте существующий return вот так
    ...state,
    rowsPerPage,
    page,
    total,
  };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */

//ДЕЛАЕМ ФУНКЦИЮ render() АСИНХРОННОЙ
async function render(action) {
  let state = collectState(); // состояние полей из таблицы
  // let result = [...data]; // копируем для последующего изменения

  //let result заменили на:
  let query = {};

  // @todo: использование

  //ЗАКОМЕНТИРОВАЛ СТРОКИ С ВЫЗОВОМ ФУНКЦИЙ APPLY
  // result = applySearch(result, state, action);
  // result = applyFiltering(result, state, action);
  // result = applySorting(result, state, action);
  // result = applyPagination(result, state, action);

  query = applySearch(query, state, action);
  query = applyFiltering(query, state, action);
  query = applySorting(query, state, action);
  query = applyPagination(query, state, action);

  //ДОБАВЛЯЕМ ПОЛУЧЕНИЕ ДАННЫХ
  const { total, items } = await api.getRecords(query);

  updatePagination(total, query);

  // sampleTable.render(result)
  // В sampleTable.render() передаём items вместо result
  sampleTable.render(items);
}

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render,
);

// @todo: инициализация

//МЕНЯЕМ ИНИЦИАЛИЗАЦИЮ ПАГИНАЦИИ С const applyPagination НА const {applyPagination, updatePagination}
const { applyPagination, updatePagination } = initPagination(
  sampleTable.pagination.elements, // передаём сюда элементы пагинации, найденные в шаблоне
  (el, page, isCurrent) => {
    // и колбэк, чтобы заполнять кнопки страниц данными
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  },
);

const applySorting = initSorting([
  // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements,
);

const applySearch = initSearching("search");

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

//В самом конце файла перед вызовом рендера объявляем асинхронную функцию init()

async function init() {
  // внутри init() получаем индексы const indexes = await api.getIndexes()
  const indexes = await api.getIndexes();
  // return indexes;

  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers,
  });
}

// render();
//Заменяем вызов render на init().then(render)
init().then(render);
