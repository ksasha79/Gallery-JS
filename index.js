import { ALL_FILMS, LIKED_FILMS } from './js/constants.js';
import { fromStorage } from './js/fromStorage.js';
import { MOCK_FILMS } from './filmsMock.js';
import { toStorage } from './js/toStorage.js';

if (!fromStorage(ALL_FILMS)) {
    toStorage(ALL_FILMS, MOCK_FILMS);
}

const hash = window.location.hash.split('#')[1] || ALL_FILMS;
const fistData = hash === LIKED_FILMS ?
    fromStorage(ALL_FILMS).filter((film) => film.favorite) :
    fromStorage(ALL_FILMS);

const switcherBtnHTML = document.querySelector('.films-container__switch-btn');

switcherBtnHTML.addEventListener('click', switchFilmsHandler);

renderFilms(hash, fistData);

function renderFilms(listType, data) {
    const switcherBtnHTML = document.querySelector('.films-container__switch-btn');
    const filmsList = data;
    switcherBtnHTML.insertAdjacentHTML(
        'afterend',
        `<div id="${listType}" class="film-cards-container"></div>`
    );

    const filmCardsContainerHTML = document.querySelector('.film-cards-container');

    if (!data.length) {
        filmCardsContainerHTML.innerHTML = '<div>You do not have liked fotos</div>';
    }

    filmCardsContainerHTML.addEventListener('click', handleContainerClick);

    filmsList.forEach((film) => renderFilmItem(film, filmCardsContainerHTML));

}

function renderFilmItem(filmData, root) {
    const { movieName, imgUrl, releaseYear, favorite, id } = filmData;

    const likeUrl = favorite ? 'like.png' : 'unLike.png';

    const html = `
        <div class="film-card" data-id="${id}">
            <div class="film-card__img-wrp">
                <img class="film-card__img" src="${imgUrl}" />
            </div>
            <a class="film-card__title">
            ${movieName}
            </a>
            <span class="film-card__year">
                ${releaseYear} г.
            </span>
            <button class="film-card__btn">
                <img class="film-card__btn-img" src="assets/img/${likeUrl}" />
            </button>
        </div>
    `;

    root.insertAdjacentHTML('beforeend', html);
}

function switchFilmsHandler(event) {
    event.preventDefault();
    const switchHTML = event.target;
    const titleHTML = document.querySelector('.films-container__title');

    const filmCardsContainerHTML = document.querySelector('.film-cards-container');
    const typeId = filmCardsContainerHTML.id;

    const hash = typeId === ALL_FILMS ? LIKED_FILMS : ALL_FILMS;
    window.history.pushState(
        null,
        '',
        `${window.location.origin + window.location.pathname}#${hash}`
    );

    const filmList = fromStorage(ALL_FILMS);

    switch (typeId) {
        case ALL_FILMS:
            titleHTML.innerHTML = 'Мои любимые фото';
            switchHTML.innerHTML = 'Все фото дайвинга из Турции 14-07-2021';
            const filteredFilms = filmList.filter((film) => film.favorite);
            filmCardsContainerHTML.remove();
            renderFilms(LIKED_FILMS, filteredFilms);
            return;
        case LIKED_FILMS:
            titleHTML.innerHTML = 'Все фото дайвинга из Турции 14-07-2021';
            switchHTML.innerHTML = 'Мои любимые фото';
            filmCardsContainerHTML.remove();
            renderFilms(ALL_FILMS, filmList);
            return;
        default:
            return;
    }
}

function handleContainerClick(event) {
    const target = event.target;

    if (target.classList.contains("film-card__title")) {
        const dataId = target.closest('.film-card').dataset.id;
        renderCardModal(dataId);
        return;
    }

    const likeBtnHTML = target.closest('button');
    let filmList = fromStorage(ALL_FILMS);
    const filmCardsContainerHTML = document.querySelector('.film-cards-container');
    const typeId = filmCardsContainerHTML.id;

    if (likeBtnHTML) {
        const dataIdAttr = likeBtnHTML.closest('.film-card').dataset.id;
        console.log(dataIdAttr);

        filmList = filmList.map((film) => {
            if (String(film.id) === String(dataIdAttr)) {
                return {
                    ...film,
                    favorite: !film.favorite,
                }
            }

            return film;
        })
        toStorage(ALL_FILMS, filmList);

        switch (typeId) {
            case ALL_FILMS:
                filmCardsContainerHTML.remove();
                renderFilms(ALL_FILMS, filmList);
                return;
            case LIKED_FILMS:
                const filteredFilms = fromStorage(ALL_FILMS).filter((film) => film.favorite);
                filmCardsContainerHTML.remove();
                renderFilms(LIKED_FILMS, filteredFilms);
                return;
            default:
                return;
        }
    }
}

function renderCardModal(filmId) {
    const filmList = fromStorage(ALL_FILMS);
    const film = filmList.find((film) => String(film.id) === filmId);
    const root = document.getElementById('root');

    const modalContainer = `
        <div class="modalContainer">
            <div class="modal">
                <header class='modal__header'>
                    <buttuon class="modal__close">&times;</button>
                </header>
            </div>
        </div>
    `;

    root.insertAdjacentHTML('beforeend', modalContainer);

    const modalHTML = document.querySelector('.modal');
    const modalContainerHTML = document.querySelector('.modalContainer');
    const closeBtnHTML = document.querySelector('.modal__close');

    renderFilmItem(film, modalHTML);

    const likeBtnHTML = modalHTML.querySelector('.film-card__btn');

    closeBtnHTML.addEventListener('click', () => {
        modalContainerHTML.classList.add('hide');
        setTimeout(() => {
            modalContainerHTML.remove();
        }, 300);
    });
    likeBtnHTML.addEventListener('click', () => handleBtnClickInModal(likeBtnHTML, filmId));
}


function handleBtnClickInModal(btnHTML, filmId) {
    let filmList = fromStorage(ALL_FILMS);
    filmList = filmList.map((film) => {
        if (String(film.id) === String(filmId)) {
            return {
                ...film,
                favorite: !film.favorite,
            }
        }

        return film;
    });
    toStorage(ALL_FILMS, filmList);

    const favorite = filmList.find((film) => String(film.id) === filmId).favorite;
    const likeUrl = favorite ? 'like.png' : 'unLike.png';

    btnHTML.innerHTML = `<img class="film-card__btn-img" src="assets/img/${likeUrl}" />`;

    const filmCardsContainerHTML = document.querySelector('.film-cards-container');
    const typeId = filmCardsContainerHTML.id;

    switch (typeId) {
        case ALL_FILMS:
            filmCardsContainerHTML.remove();
            renderFilms(ALL_FILMS, filmList);
            return;
        case LIKED_FILMS:
            const filteredFilms = fromStorage(ALL_FILMS).filter((film) => film.favorite);
            filmCardsContainerHTML.remove();
            renderFilms(LIKED_FILMS, filteredFilms);
            return;
        default:
            return;
    }


}