let Paginacion = 0;
const gifosFound = [];
let searchInput = document.getElementById("buscador");
const search = document.querySelector("#icon_buscador");
const containerList = document.querySelector("#match_list");
let searchResults = document.querySelector("#resultados_busqueda");
let seccion2 = document.querySelector(".seccion2");
const closeBttn = document.querySelector("#xbutton");
let verMas = document.querySelector("#ver_mas");
let h2SearchResults = document.querySelector("#titulo_busqueda");
let matchList = document.querySelector("#match_list");
const border_search = document.querySelector(".border_search");
//--endpoint de los trending tags
const trendingTagsEndpoint = "https://api.giphy.com/v1/trending/searches";
const apiKey = "wUIs2kykDiUjqc9ljNRoH97ddpN05IwD";
const $trendingTagList = document.querySelector(".trendingTag_list");
////

// fetch autocomplete sugestions
const getSearchTags = async (word) => {
  try {
    const suggestions = await fetch(
      `https://api.giphy.com/v1/gifs/search/tags?api_key=wUIs2kykDiUjqc9ljNRoH97ddpN05IwD&limit=4&q=${word}`
    );
    return suggestions.json();
  } catch (error) {
    console.log("ocurrio un error", error);
  }
};

// fetch searched gifs
const getGifosSearch = async (Paginacion, query) => {
  try {
    const imagenes = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=wUIs2kykDiUjqc9ljNRoH97ddpN05IwD&limit=12&offset=${Paginacion}&q=${query}`
    );
    return imagenes.json();
  } catch (error) {
    console.log("ocurrio un error", error);
  }
};

// search suggestions
const autocomplete = async (ev) => {
  if (ev.key == "Enter") return;
  ev.preventDefault();

  containerList.innerHTML = "";
  border_search.style.height = "50px";
  search.style.display = "block";
  closeBttn.style.display = "none";

  if (ev.target.value.length >= 3) {
    const tags = await getSearchTags(ev.target.value);
    tags.data.map((tag) => {
      const newLi = document.createElement("li");
      newLi.textContent = tag.name;
      newLi.addEventListener(
        "click",
        (e) => (searchInput.value = e.target.innerText)
      );
      newLi.onclick = () => searchContent();
      containerList.appendChild(newLi);

      border_search.style.height = "340px";
      search.style.display = "none";
      closeBttn.style.display = "block";
    });
  }
};

//getting input for search
const searchContent = async (search) => {
  let gifosSearch = "";
  if (typeof search != "undefined") {
    searchInput.value = search;
    h2SearchResults.style.display = "block";
    matchList.style.display = "block";
  }

  gifosSearch = await getGifosSearch(Paginacion, searchInput?.value);
  h2SearchResults.style.display = "block";
  matchList.style.display = "block";

  fetchSearch(gifosSearch);
};

const viewMore = async () => {
  Paginacion += 12;
  const gifosSearch = await getGifosSearch(Paginacion, searchInput.value);
  fetchSearch(gifosSearch, true);
};

// general search function
const fetchSearch = (arr, flagViemore = false) => {
  console.log("entre aca");

  let h2SearchResults = document.querySelector("#titulo_busqueda");
  if (arr.data.length === 0) {
    h2SearchResults.innerText = "";
    searchResults.innerHTML = "";
    let noResultsTitle = document.createElement("h2");
    noResultsTitle.innerText = searchInput.value;
    noResultsTitle.setAttribute("class", "noResultsTitle");

    let noResultsImg = document.createElement("img");
    noResultsImg.setAttribute(
      "src",
      "./assets/icon-busqueda-sin-resultado.svg"
    );
    noResultsImg.setAttribute("class", "noResultsImg");

    let noResultsSuggestion = document.createElement("h3");
    noResultsSuggestion.innerText = "Intenta con otra b??squeda";

    searchResults.append(noResultsTitle, noResultsImg, noResultsSuggestion);
  } else {
    h2SearchResults.innerText = searchInput.value;
    if (!flagViemore) searchResults.innerHTML = "";
    const containerGifos = document.querySelector("#resultados_busqueda");

    let datos = arr.data.map((dato) => {
      return {
        url: dato.images.fixed_height_small.url,
        username: dato.username,
        title: dato.title,
      };
    });

    datos.forEach((x) => {
      gifosFound.push(x);
      CreateCard(
        x,
        ["searchImg"],
        containerGifos,
        (e) => {
          e.parentElement.children[0].onclick = (y) =>
            AbrirModal(
              y.target.parentElement.children[1].children[0].children[2]
                .children[0]
            );
          e.children[0].children[2].onclick = (y) => AbrirModal(y.target);
          e.children[0].children[1].onclick = (y) =>
            downloadGif(
              y.target.parentElement.parentElement.parentElement.parentElement
                .children[0],
              getCriterio(SEARCH)
            );
          e.children[0].children[0].onclick = (y) => addFav(y.target, SEARCH);
          containerList.innerHTML = "";
          verMas.style.visibility = "visible";
          verMas.addEventListener("click", viewMore);
          border_search.style.height = "50px";
        },
        SEARCH
      );
    });
  }
};

// --- Vuelve los seteos del contenedor a la configuraci??n inicial
const cleanResultsContianer = () => {
  searchResults.classList.add("hidden");
  containerList.innerHTML = "";
  border_search.style.height = "50px";
  search.style.display = "block";
  closeBttn.style.display = "none";
  h2SearchResults.innerHTML = "";
  searchResults.innerHTML = "";
  verMas.style.visibility = "hidden";
};

const getTrendingTags = async () => {
  await fetch(`${trendingTagsEndpoint}?api_key=${apiKey}`)
    .then((response) => response.json())
    .then((trendingTags) => {
      console.log(trendingTags);
      displayTrendingTags(trendingTags);
    })
    .catch((err) => console.log(err));
};

getTrendingTags();

const displayTrendingTags = (trendingTags) => {
  for (let i = 0; i < 6; i++) {
    const trendingTagItem = document.createElement("span");
    trendingTagItem.classList.add("trending__item");
    trendingTagItem.onclick = () => {
      searchContent(trendingTags.data[i]);
      search.style.display = "none";
      closeBttn.style.display = "block";
    };

    trendingTagItem.innerHTML = `${trendingTags.data[i]}`;
    $trendingTagList.appendChild(trendingTagItem);
  }
};

searchInput?.addEventListener("keyup", autocomplete);

searchInput.onkeyup = () => {
  closeBttn.style.display = "block";
  search.style.display = "none";
};

document.addEventListener("keypress", async (e) => {
  if (e.key == "Enter") {
    searchContent();
  }
});
document
  .querySelector("#iconono_buscador")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    searchContent();
  });

closeBttn.onclick = () => cleanResultsContianer();
