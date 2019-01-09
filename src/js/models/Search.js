import axios from 'axios';
import {key, proxy} from '../config';

// 42826ee9af3c1844a7ffe91d1374d1ca
// 5924647b07cd0fe1fa12df08f79077d5
// 71081be3b5fdb3949cca830e8a439e70
// 91b4c9aa161f22c25808f2e8a5ad7797
//https://www.food2fork.com/api/search

export default class Search {
    constructor (query) {
        this.query = query;
    }
    async getResults(query) {
               try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            // store results here;
            this.result = res.data.recipes;
        }catch(errors) {
            console.log('ERROR!! please check the errors below');
            console.log(errors);
        }
    }

}

