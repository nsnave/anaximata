/*
 * Author:  Aidan Evans
 * Date:    17 October 2020  
 * 
 * Automata Classes
 * 
 */



//Utils
function isArray(myArray) {
    return myArray.constructor === Array;
}

function isNumber(myNumber) {
    return myNumber.constructor === Number;
}

function isMap(myMap) {
    return myMap.constructor === Map;
}

function isString(myString) {
    return myString.constructor === String;
}



//checks if inner and a subset of outer
//  runtime: expected O(m + n)
//           m = inner.length
//           n = outer.length
function isSubset(inner, outer) {

    if (inner.length > outer.length)
        return false;

    const set = new Set();

    outer.forEach(function (item) {
        set.add(item);
    });

    for (var i = 0; i < inner.length; i++)
        if (!set.has(inner[i])) 
            return false;

    return true;
    
}



//Parent Class
class Automaton {
    
    constructor(states, alphabet, initial, transitions, final) {

        //checks if states is of the correct type
        //  if correct, then sets this._states to states appropriately
        if (isArray(states)) {

            this._states = states;

        }
        else if (isNumber(states)) {

            //creates an array of integers from 0 to 'states'
            //  e.g., states = 3 produces [0, 1, 2]
            var temp = [];
            for (var i = 0; i < states; i++) {
                temp.push(i);
            }

            this._states = temp;

        }
        else {

            throw "Invalid Type: states must be of type Array or Number";

        }


        //checks if alphabet is of the correct type
        //  if correct, then sets this._alphabet to alphabet appropriately
        if (!isArray(alphabet)) 
            throw "Invalid Type: alphabet must be of type Array";

        this._alphabet = alphabet;

        
        //checks if intitial and final are of the correct types and construction
        //  if correct, then sets variables appropriately
        if (!isArray(initial)) 
            throw "Invalid Type: initial must be of type Array";

        if (!isArray(final)) 
            throw "Invalid Type: final must be of type Array";

        if (isArray(states)) {

            if (!isSubset(initial, states)) {
                throw "Invalid Set Construction: initial must be a subset of states"
            }
            
            if (!isSubset(final, states)) {
                throw "Invalid Set Construction: final must be a subset of states"
            }

        }
        else {  //isNumber(states) == true

            for (var i = 0; i < initial.length; i++) {
                if (initial >= states) {
                    throw "Invalid Set Construction: initial must contain states with values < states"
                }
            }

            for (var i = 0; i < final.length; i++) {
                if (final >= states) {
                    throw "Invalid Set Construction: final must contain states with values < states"
                }
            }
            
        }

        this._initial = initial;
        this._final = final;
        
        
        //checks if transitions is of the correct type and construction
        //  if correct, then sets this._transitions to transitions appropriately
        if (!isMap(transitions)) 
            throw "Invalid Type: transitions must be of type Map";

        /*
        for (let [key, value] of transitions) {

            if (!isArray(key)) 
                throw "Invalid Type: the keys in transitions must be of type Array";

            if (!isArray(value)) 
                throw "Invalid Type: the values in transitions must be of type Array";

        }

        (Removed since it might be too computationally inefficient to check)

        */

        this._transitions = transitions;

    }


    get states() {
        return this._states;
    }

    set states(x) {
        this._states = x;
    }


    get alphabet() {
        return this._alphabet;
    }

    set alphabet(x) {
        this._alphabet = x;
    }


    get initial() {
        return this._initial;
    }

    set initial(x) {
        this._initial = x;
    }


    get transitions() {
        return this._transitions;
    }

    set transitions(x) {
        this._transitions = x;
    }


    get final() {
        return this._final;
    }

    set final(x) {
        this._final = x;
    }

}


//Child Classes
//Non-Deterministic Finite Automaton
class NFA extends Automaton {

    constraints = {
        states     : "Array",
        alphabet   : "Array",
        initial    : "Array",
        transitions: "Map",
        final      : "Array" 
    };

    constructor(states, alphabet, initial, transitions, final) {

        super(states, alphabet, initial, transitions, final);

    }

}


//Deterministic Finite Automaton (DFA)
class DFA extends Automaton {

    constraints = {
        states     : "Array",
        alphabet   : "Array",
        initial    : "Object",
        transitions: "Map",
        final      : "Array" 
    };

    constructor(states, alphabet, initial, transitions, final) {

        super(states, alphabet, [initial], transitions, final);


        //makes sure DFA is complete
        //  i.e., transitions is defined everywhere
        //        (states X alphabet -> states)


    }

}


