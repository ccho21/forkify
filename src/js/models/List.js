import uniqid from 'uniqid';

export default class List {
    constructor () {
        this.items = [];
    }
    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        };
        this.items.push(item);
        return item;
    }
    deleteItem (id) {
        const index = this.items.findIndex(el => el.id === id);
        // it changes the original array on the other hand, slice does'not
        // [2, 4, 8] splice => return 4 original array [2]
        // [2, 4, 8] slice(1, 2) -> returns 4 orinal array is [2, 4, 8]
        this.items.splice(index, 1);
    }
    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}