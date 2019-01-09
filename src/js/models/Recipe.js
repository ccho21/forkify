import axios from 'axios';
import {key, proxy} from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (errors) {
            console.log(errors);
            alert('something went wrong :(');
        }
    }

    calcTime() {
        // Assuming that we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;

    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'tsps', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        const newIngredients = this.ingredients.map((el) => {
            // 1) Uniform units

            // 1 1/2 TOMATO PASTA
            let ingredient = el.toLowerCase();
            // 1 1/2 teaspoons (tomato pasta)
            unitsLong.forEach((unit, i) => {
                // 1 1/2 tsp (tomato pasta)
                ingredient = ingredient.replace(unit, units[i]);
            });
            // 2) remove parentheses;

            // 1 1/2 tsp tomato pasta
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //3 Parse ingredients into count, unit, and ingredients;

            // [1, 1/2, tsp, tomato, pasta]
            const arrIng = ingredient.split(' ');


            // unitShort.includes(el2) checks if there is an element of element of arrIng
            // if there is then return true and it returns the index of  arrIng;
            // if there is no unit then it should be -1
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            let objIng;
            if (unitIndex > -1) {
                // There is a unit

                // Ex. 4 1/2 cups, arrCount is [4, 1/2] -> "4+1/2"
                // Ex. 4 cups, arrCount is [4]

                // arrCount = [1, 1/2]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;

                // arrCount.length = 2
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                }else {
                    // arrIng = ['1, 1/2','tomato','pasta'].slice(0, 2) = ['1', '1/2']
                    // count = '1+1/2' turns to 1.5
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                objIng ={
                    count, // 1.5
                    unit: arrIng[unitIndex], // [tsp]
                    ingredient: arrIng.slice(unitIndex+1).join(' ') // '1.5 tsp tomato pasta'
                }

            } else if (parseInt(arrIng[0]), 10) {
                // there is no unit, but 1st element is number;
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // there is no unit and no number for position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        // servings
        const newServings = type === 'dec' ? this.servings -1 : this.servings + 1;

        // ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });
        this.servings = newServings;
    }
}