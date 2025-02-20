var UI_BLACKJACK =
{
    data: null,
    initialized: false,
    initialize: function ()
    {
        if (!this.initialized)
        {
            this.initialized = true;
        }
    },
    render: function ()
    {
        /*
        <div id="blackjack" style="width: 400px;">
            <div id="bj_dialog">
                Dealer says stuff here
            </div>
            <div id="bj_bet">
                Bet <input type="number" id="bet_number" style="width: 60px;" />
            </div>
            <div id="bj_table">
                <div style="display: grid; grid-auto-flow: column;">
                    <div>Player</div>
                    <div style="display: grid; grid-auto-flow: column;">
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                    </div>
                </div>
                <div style="display: grid; grid-auto-flow: column;">
                    <div>Dealer</div>
                    <div style="display: grid; grid-auto-flow: column;">
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                        <div class="bj_card">K</div>
                    </div>
                </div>
            </div>
            <div class="info" style="display: grid; grid-auto-flow: column;">
                <div>Player:</div><div>110</div><div>Dealer:</div><div>110</div>
            </div>
            <div class="actions">
                <button class="green">Place Bet</button>
                <button class="blue">Hit</button>
                <button class="blue">Stand</button>
                <button class="red">Cancel</button>
            </div>
        </div>*/
    },
    exit: function ()
    {
    },
}