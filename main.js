let searchForm = document.querySelector('#search');
modalSettingsGenerate();
let modal = createModal();
let maxResult = parseInt(sessionStorage.getItem('maxResult')) || 9;
let step = 0;


let settings = {
    filter: "",
    sortType: "relevance",
    printType: "all",
    foundBookText: ""
};


searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    settings.foundBookText = document.querySelector('#found-book').value;
    let foundResultBlock = document.querySelector(".result");
    let errorBlock = document.querySelector('#error');
    if (!settings.foundBookText) {
        errorBlock.innerHTML = "Введите название книги или автора";
    } else {
        errorBlock.innerHTML = '';
        startSearch(maxResult);
        foundResultBlock.style.display = "block";
        setTimeout(() => {
            foundResultBlock.classList.add("active")
        }, 0);
        setResultString();
        let contentBlock = document.querySelector(".content");
        if (!contentBlock.classList.contains("active")) {
            contentBlock.classList.add("active");
        }
    }

});
let startSearch = (maxResult, next) => {
    getBook(maxResult, next).then(
        (data) => {
            document.querySelector('.result').classList.remove("disabled");
            createBooks(data);
        });
};


document.querySelector("#reset").addEventListener("click", (e) => {
    e.preventDefault();
    location.reload();
});

let correctQuery = (next) => {
    if (next) {
        step += maxResult
    } else {
        step = 0;
        document.querySelector('#insert-books').innerHTML = "";

    }
    let url = `https://www.googleapis.com/books/v1/volumes?q=${settings.foundBookText}&printType=${settings.printType?settings.printType:""}&startIndex=${step}&maxResults=${maxResult}&orderBy=${settings.sortType}`;
    return url;
}

async function getBook(maxResult, next) {

    next || document.querySelector('.result').classList.add("disabled");

    let url = correctQuery(next);

    try {
        let response = await fetch(url);
        let data = await response.json();
        let totalCount = data.totalItems;
        let booksInfo = await data.items;
        return [booksInfo, totalCount];

    } catch (err) {
        alert(err); // TypeError: failed to fetch
    }
}

function createBooks(dataBody) {
    let [data, totalCount] = dataBody;
    console.log(totalCount);
    if (!data) {
        let errorMessageH4 = "<h4 class='error'>Результатов поиска больше не обнаружено</h4>";
        insertElementInNode('insert-books', errorMessageH4);
        toggleBtnPagination();
        return;
    }
    toggleBtnPagination(true);
    insertElementInNode('fail', "");

    let books = data.map((book, id) => {
        return (`<div  class="book">
                    <div class="book__image">
                    
                        <img src="${book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : "https://st2.depositphotos.com/1364916/6359/v/600/depositphotos_63590137-stock-illustration-blue-book-logo-vector.jpg"}"
                             alt="book">
                    </div>
                    <div class="book__text">
                        <div class="book__title">
                            <h4 >${book.volumeInfo.title}</h4>
                            <h5>${book.volumeInfo.authors ? book.volumeInfo.authors[0] : "Автор неизвестен"}</h5>
                        </div>
                        <div class="book__buttons">
                            <button data-id="${id}" data-btn="click" class="btn btn__book btn--primary btn--small uppercase">Подробнее</button>
                            <!--<button class="btn btn&#45;&#45;primary btn&#45;&#45;small uppercase">Скрыть</button>-->
                        </div>
                    </div>
                </div>`)
    });

    insertElementInNode('insert-books', books);
    addEventForCreateModal(data);
}

const toggleBtnPagination = (active) =>{
    let btnPagination = document.querySelector('#next-page');
    btnPagination.addEventListener('click', generateNextPage);
    if (active) {
        if (!btnPagination.classList.contains('active')) {
            btnPagination.classList.add('active')
        }

    } else {
        btnPagination.classList.remove('active');
    }

}


function insertElementInNode(idNodeElem, elem = []) {
    let nodeElem = document.querySelector(`#${idNodeElem}`);
    if (!Array.isArray(elem)) {
        nodeElem.innerHTML += elem;
    } else {
        elem = elem.join(" ");
        nodeElem.innerHTML += elem;
    }
}

let generateNextPage = (e) => {
    e.preventDefault();
    let next = true;
    startSearch(maxResult, next);

};

function createModal() {
    let modal = new Modal({
        modalTitle: "Подробная информация",
        modalText: "Desc",
        modalFooter: [,
            {
                text: "ЗАКРЫТЬ",
                type: "",
                closable: true,
                handler() {
                    modal.close();
                    modal.$modal.style.overflowX = "hidden";
                    document.body.style.overflow = "auto";
                    console.log('Danger btn was clicked')
                }
            }
        ]

    });
    return modal;
}


//событие для вызова модальных окон
function addEventForCreateModal(data) {
    let btns = document.querySelectorAll("button[data-btn]");
    btns = [...btns];
    btns.forEach(btn => {
        btn.addEventListener('click', event => {
            event.preventDefault();
            let bookID = btn.dataset.id;

            modal.setContent(`
                <div class="modal-body">
                    <div class="modal-img book__image">
                        <img src="${data[bookID].volumeInfo.imageLinks ? data[bookID].volumeInfo.imageLinks.thumbnail : "https://st2.depositphotos.com/1364916/6359/v/600/depositphotos_63590137-stock-illustration-blue-book-logo-vector.jpg"}" alt="book">
                    </div>
                    <div class="modal-text">
                        <div class="title">
                            <h3>${data[bookID].volumeInfo.title}</h3>
                        </div>
                        <div class="author">
                            <h5>${data[bookID].volumeInfo.authors ? data[bookID].volumeInfo.authors[0] : "Автор неизвестен"}</h5>
                        </div>
                        <div class="description">
                            <p>${data[bookID].volumeInfo.description ? data[bookID].volumeInfo.description.substr(0, 400) + "..." : "Описание не указано."}</p>
                        </div>
                        <div class="publisher">
                            <p><strong>Издетельство: </strong>${data[bookID].volumeInfo.publisher ? data[bookID].volumeInfo.publisher : "неизвестено"}</p>
                        </div>
                        <div class="publisher-date">
                            <p>${data[bookID].volumeInfo.publishedDate ? data[bookID].volumeInfo.publishedDate : ""}</p>
                        </div>
                        <div class="read-link">
                            <p>
                                <a href="${data[bookID].accessInfo.webReaderLink
                ? data[bookID].accessInfo.webReaderLink
                : " "}"></a>
                            </p>
                        </div>
                    </div>
                </div>
            `)
            modal.open();
            document.body.style.overflow = "hidden";
            modal.$modal.style.overflowX = "auto";
        })
    });

}

//вызов модального окна для настроек
function modalSettingsGenerate() {
    let settingsBtn = document.querySelector("#settings");
    settingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        $.asyncModal({
            modalTitle: "Настройки поиска",
            modalText: `<div>
    
    <form  id="search-settings">        
        <div class="settings-item">
            <span>Сортировать по:</span>
            <input type="radio" name="sort" id="sort1" ${settings.sortType==="relevance" && "checked"} value="relevance">
            <label for="sort1">По релевантности</label>
            <input type="radio" id="sort2"
                   name="sort" ${settings.sortType==="newest" && "checked"} value="newest">
            <label for="sort2">Новейшие</label>
        </div>
        <div class="settings-item">
            <label for="print-type">Тип печати:</label>
            <select name="printType" id="printType" form="search-settings">
                <option ${settings.printType==="all" && "selected"} value="all">Любой</option>
                <option ${settings.printType==="books" && "selected"} value="books">Книги</option>
                <option ${settings.printType==="magazines" && "selected"} value="magazines">Журналы</option>                
            </select>
        </div>


        <div class="settings-item">
            <label for="filter">Фильтр поиска:</label>
            <select name="filter" id="filter" form="search-settings">
                <option ${settings.filter==="" && "selected"} value="">Без фильтров</option>
                <option  ${settings.filter==="partial" && "selected"} value="partial" >Демо версии</option>
                <option  ${settings.filter==="full" && "selected"} value="full">Полные версии</option>
                <option  ${settings.filter==="free-ebooks" && "selected"} value="free-ebooks">Бесплатные</option>
                <option  ${settings.filter==="paid-ebooks" && "selected"} value="paid-ebooks">Платные</option>
            </select>
        </div>
       
    </form>
</div> `,

        }).then(() => {
            console.log('saved');
            console.log(getSettingsValue());
            let newSettings = getSettingsValue();
            settings = {
                ...settings,
                ...newSettings
            };
            startSearch(maxResult);
            setResultString();



        }).catch(() => {
            console.log("cancel");

        })

    })
}

let getSettingsValue = () => {
    let form = document.forms[1];
    let sortType = form.elements.sort.value;
    let printType = form.elements.printType.value;
    let filter = form.elements.filter.value;
    console.log(sortType, printType, filter);
    return {
        sortType,
        printType,
        filter
    }
};


let setResultString = ()=>{
    let foundBookBlock = document.querySelector('#found-text');
    let resultString = settings.foundBookText;
    if(settings.filter){
        resultString += " фильтр : "+settings.filter;
    } else if(settings.printType!=="all"){
        resultString += " тип печати : "+settings.printType;
    }
    foundBookBlock.innerHTML=resultString;
}