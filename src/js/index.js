// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';

// GLOBAL STATE OF THE APP
// - Search Object
// - Current recipe object
// - Shopping list object
// - Liked recipes

const state = {};
/*
Search Controller
*/

const controlSearch = async () => {
    // 1) get query from the view
    const query = searchView.getInput(); // TODO: next lecture;
    // const query = 'pizza';
    if (query) {
        // 2) new search object and add it to state;
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        // 4) Search for recipes
        try {
            await state.search.getResults();
            clearLoader();

            // 5) render results on UI;
            searchView.renderResults(state.search.result);
        }
        catch (errors) {
            console.log(errors);
            alert('something went wrong processing recipe!');
            clearLoader();
        }
    }
};


/*
Recipe Controller
*/

const controlRecipe = async () => {
    // Get the ID from URL
    const id = window.location.hash.replace('#', '');
    if (id) {
        // PREPARE FOR UI CHANGES
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight Selected Search item
        if (state.search) searchView.highlightSelected(id);

        // CREATE new recipe object
        state.recipe = new Recipe(id);
        // Get recipe data
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            // Calculate servings and time
            state.recipe.calcServings();
            state.recipe.calcTime();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        }
        catch (errors) {
            console.log(errors);
            alert('something went wrong processing recipe!');
        }
    }
}

/*
List Controller
*/

const controlList = () => {
    // Create a new list If there in non yet,
    if (!state.list) state.list = new List();
    // Add each ingredient to the list and user Interface
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

/*
Likes Controller
*/

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();

    // User has not yet liked current recipe
    const currentID = state.recipe.id;
    if (!state.likes.isLiked(currentID)) {
        // add Like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img);
        // Toggle the like button
        likesView.toggleLikeBtn(true);
        // ADD like to UI List
        likesView.renderLike(newLike);
    }
    // User has liked current recipe
    else {
        // remove Like to the state
        state.likes.deleteLike(currentID);
        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // remove like to UI List
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


/*
Event handler
*/

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => {
    window.addEventListener(event, controlRecipe)
});

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button;
    likesView.toggleLikeMenu(state.likes.getNumLikes());

//    Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// TESTING
window.addEventListener('load', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


//Handle delete and update item event
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);
    }
    // Handle the update event
    else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, value);
    }
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add Ingredients to shopping list;
        controlList();
    }
    else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like Controller
        controlLike();
    }

});