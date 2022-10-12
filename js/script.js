// массив из товаров
const data = [{
    id: 1,
    name: 'Коптильня 10л',
    price: 1200,
    image: 'images/bravo-10.png',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Aliquam quis rhoncus mi. Duis ultrices augue nunc, sit amet placerat ligula pretium vel.
        Aenean eget quam ante. Duis ipsum dui, euismod id tristique id, consectetur vitae enim.
        Nunc finibus consequat risus, vel tristique ex dapibus et.
        Proin tempus nulla quis erat blandit vehicula.
        Duis ipsum dui, euismod id tristique id, consectetur vitae enim.
        Aliquam quis rhoncus mi.`
}, {
    id: 2,
    name: 'Коптильня 20л',
    price: 1400,
    image: 'images/bravo-20.png',
    description: `Aliquam quis rhoncus mi. Duis ultrices augue nunc, sit amet placerat ligula pretium vel.
        Aenean eget quam ante. Duis ipsum dui, euismod id tristique id, consectetur vitae enim. Nunc
        finibus consequat risus, vel tristique ex dapibus et. Proin tempus nulla quis erat blandit
        vehicula.
        Aenean eget quam ante.
        Duis ipsum dui, euismod id tristique id, consectetur vitae enim.`
}, {
    id: 3,
    name: 'Коптильня 30л',
    price: 1600,
    image: 'images/bravo-30.png',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Aliquam quis rhoncus mi. Duis ultrices augue nunc, sit amet placerat ligula pretium vel.
        Aenean eget quam ante. Proin tempus nulla quis erat blandit vehicula.
        Aenean eget quam ante. Duis ipsum dui, euismod id tristique id, consectetur vitae enim.`
}];


// ID элементов, которые сейчас в корзине
const basket = new Set();


// добавление элемента в корзину
// item: элемент из data
// htmlButton: элемент в HTML
const addToBasket = (item,htmlButton) => {
    htmlButton.innerHTML = 'Добавлено';   // меняем текст
    htmlButton.classList.add('active');   // меняем цвет
    htmlButton.disabled = true;           // делаем некликабельной

    basket.add(item.id);
    recalcPrice();
}


// пересчет суммы
const recalcPrice = () => {
    const totalPrice = [...basket].reduce((prev, cur) => prev + data.find(e => e.id === cur)?.price || 0, 0);
    document.querySelector('#total-price').innerHTML = formatPrice(totalPrice);
}


// форматируем цену c пробелами и в рублях
const formatPrice = price => new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    currencyDisplay: 'narrowSymbol',    // знак рубля
    useGrouping: true                   // группировка по тысяче
}).format(price);




// добавляем HTML-элемент, вешаем классы и свойства, подцепляем к родительскому элементу
const addElement = options => {
    const element = document.createElement(options.tag);

    if (options.class) {
        element.classList.add(options.class);
    }

    if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
    }

    if (options.parent) {
        options.parent.appendChild(element);
    }

    return element;
}


// строим HTML дерево для одного продукта и подцепляем это дерево в элемент product
const buildItem = item => {
    const product = addElement({ tag: 'div', class: 'product' });

    const productTitle = addElement({ tag: 'div', class: 'product-title', parent: product });
    const productTitleText = addElement({ tag: 'span', class: 'product-title-text', parent: productTitle, innerHTML: item.name });

    const productDescription = addElement({ tag: 'div', class: 'product-description', parent: product });
    const image = addElement({ tag: 'div', class: 'image', parent: productDescription })
    const imgItem = addElement({ tag: 'img', parent: image })
    imgItem.src = item.image;

    const description = addElement({ tag: 'div', class: 'description', parent: productDescription });
    const descriptionText = addElement({ tag: 'p', class: 'description-text', parent: description, innerHTML: item.description || 'Нет описания' });

    const summa = addElement({ tag: 'div', class: 'sum', parent: productDescription });
    const price = addElement({ tag: 'span', class: 'price', parent: summa, innerHTML: formatPrice(item.price) });

    const buttonBlock = addElement({ tag: 'div', class: 'button-block', parent: product });
    const button = addElement({ tag: 'button', class: 'product-button', parent: buttonBlock, innerHTML: 'Добавить в корзину' });
    button.addEventListener('click', () => {
        addToBasket(item, button);
    });

    const parent = document.querySelector('#products');
    parent.appendChild(product);
};


// перебираем массив data, собираем каждый элемент по порядку
const buildElements = () => data.forEach(e => buildItem(e));


// ставим обработчик на событие загрузки документа, вычисляем начальную сумму (= 0) и строим дерево из элементов
addEventListener('DOMContentLoaded', () => {
    recalcPrice();
    buildElements();
});
