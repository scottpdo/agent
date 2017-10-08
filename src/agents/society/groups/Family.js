import _ from 'lodash';
import uuid from 'uuid/v1';

import demographics from '../../data/demographics';

import Citizen from '../individuals/Citizen';
import LifeEvent from '../LifeEvent';

export default class Family {
    
    constructor(society) {

        this.size = 0;
        this.society = society;
        this.members = [];
        this.name = demographics.lastname();
        
        this.seed();
    }
    
    addChild(a, b, year) {

        if (_.isNil(year)) year = this.society.year;

        let c = new Citizen(this);
        
        c.parents.push(a);
        c.parents.push(b);
        
        a.children.push(c);
        b.children.push(c);

        this.members.push(c);
        this.size++;

        a.record(new LifeEvent(year, "haveChild", c));
        b.record(new LifeEvent(year, "haveChild", c));

        c.record(new LifeEvent(year, "bornTo", c));
        c.siblings().forEach(sibling => sibling.record(new LifeEvent(year, "siblingBorn", c)));

        return c;
    }

    // at minimum, this will give us two potential parents
    // (a married couple)
    seed() {

        const year = this.society.year;
        let birthOfYoungestChild = year;

        let a = new Citizen(this);
        let b = new Citizen(this);

        a.age = demographics.age(25, 35);
        b.age = demographics.age(25, 35);
        a.birthYear = year - a.age;
        b.birthYear = year - b.age;

        this.members.push(a);
        this.members.push(b);
        this.size = this.members.length;

        a.marry(b);

        // 0-3 children
        // 20 years or younger than the younger parent
        let n = _.random(0, 3);
        
        for (let i = 0; i < n; i++) {
            
            let age = Math.min(a.age, b.age);
            age -= 20;
            age = _.random(0, age);

            let c = this.addChild(a, b, year - age);
            
            c.age = age;
            c.birthYear = year - age;

            const ev1 = a.getEvent(year - age, "haveChild", c);
            ev1.year = year - age;

            const ev2 = b.getEvent(year - age, "haveChild", c);
            ev2.year = year - age;

            if (age < birthOfYoungestChild - age) birthOfYoungestChild = year - age;
        }

        birthOfYoungestChild--;
        a.getEvent(year, "marry", b).year = birthOfYoungestChild;
        b.getEvent(year, "marry", a).year = birthOfYoungestChild;
    }

    info() {
        return this.name + ": " + this.size;
    }
};