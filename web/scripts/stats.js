let STATS = (function () {
    /**
     * Handles showing statistics on the HTML that runs our video game
     * @constructor
     */
    function STATS()
    {
        this.current_time_stamp = new Date().getTime();
        this.previous_time_stamp = 0;
        this.frames_this_second = 0;
        this.elapsed_ms = 0;
        this.current_fps = 0;
        this.html_element = null;
    };

    /**
     * Checks the FPS and also updates the stats element (if it exists)
     * @returns void
     */
    STATS.prototype.checkFPS = function ()
    {
        if (!this.html_element)
        {
            this.html_element = document.getElementById('stats');
        }

        if (this.html_element)
        {
            ++this.frames_this_second;

            this.previous_time_stamp = this.current_time_stamp;
            this.current_time_stamp = new Date().getTime();
            this.elapsed_ms += this.current_time_stamp - this.previous_time_stamp;
            this.current_fps = 1000 / (this.current_time_stamp - this.previous_time_stamp);

            // Update every second
            if (this.elapsed_ms >= 1000 && !this.html_element.classList.contains('hide'))
            {
                this.html_element.innerHTML = this.frames_this_second + 'fps';
                this.elapsed_ms -= 1000;
                this.frames_this_second = 0;
                this.html_element.innerHTML += ' - ' + document.querySelectorAll('*').length + 'els';
            }
        }
    };
    return new STATS();
})();
