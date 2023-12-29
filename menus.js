// TODO:
// Inputs (events, keyboard, mouse, etc...)
// Update game state (of some sort)
// Confirmations

MENUS = {
    list: ['date', 'fullscreen'],
    state: [0, 0],
    hide: function (name) {
        if (!name) {
            for (var i = 0; i < this.list.length; i++) {
                document.querySelector('.menu.' + this.list[i]).style.display = 'none';
                this.state[i] = 0;
            }
        } else {
            document.querySelector('.menu.' + name).style.display = 'none';
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i] === name) {
                    this.state[i] = 0;
                }
            }
        }
    },
    show: function (name) {
        if (!name) {
            for (var i = 0; i < this.list.length; i++) {
                document.querySelector('.menu.' + this.list[i]).style.display = 'block';
                this.state[i] = 1;
            }
        } else {
            document.querySelector('.menu.' + name).style.display = 'block';
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i] === name) {
                    this.state[i] = 1;
                }
            }
        }
    },
    toggle: function (name) {
        if (!name) {
            for (var i = 0; i < this.list.length; i++) {
                if (this.state[i] === 0) {
                    document.querySelector('.menu.' + this.list[i]).style.display = 'block';
                    this.state[i] = 1;
                } else {
                    document.querySelector('.menu.' + this.list[i]).style.display = 'none';
                    this.state[i] = 0;
                }
            }
        } else {
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i] === name) {
                    if (this.state[i] === 0) {
                        document.querySelector('.menu.' + this.list[i]).style.display = 'block';
                        this.state[i] = 1;
                    } else {
                        document.querySelector('.menu.' + this.list[i]).style.display = 'none';
                        this.state[i] = 0;
                    }
                }
            }
        }
    },
    setYear: function(year) {
        document.querySelector('.menu.date .year').innerHTML = year;
    },
    setMonth: function(month) {
        document.querySelector('.menu.date .month').innerHTML = month;
    },
    setDay: function(day) {
        document.querySelector('.menu.date .day').innerHTML = day;
    },
};
