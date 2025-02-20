var UI_BANK =
{
    data: {
        scene: null,
        bank: null,
    },
    rendered: false,
    initialized: false,
    initialize: function ()
    {
        if (!this.initialized)
        {
            this.data = {
                scene: new GAME_DATA_SCENE_BANK(wasm.exports),
                bank: new GAME_DATA_BANK(wasm.exports),
            };
            this.initialized = true;
            this.rendered = false;
        }
    },
    deposit: function ()
    {
        var amount = document.getElementById("bank").querySelector("#bank_input_number").value;
        this.data.bank.to_deposit = amount;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_BANK_DEPOSIT"));
        if (!is_sentry(this.data.scene.error_code))
        {
            // ERROR_BANK_NOT_ENOUGH_DEPOSIT
            // ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD
            // ERROR_BANK_NOT_ENOUGH_WITHDRAW
            // ERROR_BANK_WITHDRAW_MORE_THAN_DEPOSIT
            // ERROR_BANK_PAY_EXISTING_LOAN_FIRST
            // ERROR_BANK_NOT_ENOUGH_LOAN
            // ERROR_BANK_TOO_MUCH_LOAN
            // ERROR_BANK_NO_LOAN
            // ERROR_BANK_PAY_LOAN_NOT_ENOUGH
            // ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD
            // ERROR_BANK_PAY_LOAN_MORE_THAN_LOAN
        }
        // So we can force a one time rerender
        this.rendered = false;
        this.render();
    },
    takeLoan: function ()
    {
        var amount = document.getElementById("bank").querySelector("#bank_input_number").value;
        this.data.bank.to_loan = amount;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_BANK_TAKE_LOAN"));
        if (!is_sentry(this.data.scene.error_code))
        {
            // ERROR_BANK_NOT_ENOUGH_DEPOSIT
            // ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD
            // ERROR_BANK_NOT_ENOUGH_WITHDRAW
            // ERROR_BANK_WITHDRAW_MORE_THAN_DEPOSIT
            // ERROR_BANK_PAY_EXISTING_LOAN_FIRST
            // ERROR_BANK_NOT_ENOUGH_LOAN
            // ERROR_BANK_TOO_MUCH_LOAN
            // ERROR_BANK_NO_LOAN
            // ERROR_BANK_PAY_LOAN_NOT_ENOUGH
            // ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD
            // ERROR_BANK_PAY_LOAN_MORE_THAN_LOAN
        }
        // So we can force a one time rerender
        this.rendered = false;
        this.render();
    },
    payLoan: function ()
    {
        var amount = document.getElementById("bank").querySelector("#bank_input_number").value;
        this.data.bank.to_loan = amount;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_BANK_PAY_LOAN"));
        if (!is_sentry(this.data.scene.error_code))
        {
            // ERROR_BANK_NOT_ENOUGH_DEPOSIT
            // ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD
            // ERROR_BANK_NOT_ENOUGH_WITHDRAW
            // ERROR_BANK_WITHDRAW_MORE_THAN_DEPOSIT
            // ERROR_BANK_PAY_EXISTING_LOAN_FIRST
            // ERROR_BANK_NOT_ENOUGH_LOAN
            // ERROR_BANK_TOO_MUCH_LOAN
            // ERROR_BANK_NO_LOAN
            // ERROR_BANK_PAY_LOAN_NOT_ENOUGH
            // ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD
            // ERROR_BANK_PAY_LOAN_MORE_THAN_LOAN
        }
        // So we can force a one time rerender
        this.rendered = false;
        this.render();
    },
    withdraw: function ()
    {
        var amount = document.getElementById("bank").querySelector("#bank_input_number").value;
        this.data.bank.to_loan = amount;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_BANK_WITHDRAW"));
        if (!is_sentry(this.data.scene.error_code))
        {
            // ERROR_BANK_NOT_ENOUGH_DEPOSIT
            // ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD
            // ERROR_BANK_NOT_ENOUGH_WITHDRAW
            // ERROR_BANK_WITHDRAW_MORE_THAN_DEPOSIT
            // ERROR_BANK_PAY_EXISTING_LOAN_FIRST
            // ERROR_BANK_NOT_ENOUGH_LOAN
            // ERROR_BANK_TOO_MUCH_LOAN
            // ERROR_BANK_NO_LOAN
            // ERROR_BANK_PAY_LOAN_NOT_ENOUGH
            // ERROR_BANK_NOT_ENOUGH_PLAYER_GOLD
            // ERROR_BANK_PAY_LOAN_MORE_THAN_LOAN
        }
        // So we can force a one time rerender
        this.rendered = false;
        this.render();
    },
    render: function ()
    {
        if (this.rendered) { return; }
        this.rendered = true;
        var html = ``;
        var dialog_string = GAME_STRINGS[this.data.scene.dialog_id];
        if (!STRINGS[dialog_string])
        {
            console.error(`Missing dialog string for bank [${dialog_string}]`);
        }
        var output_string = STRINGS[dialog_string];
        if (dialog_string === "ACTION_BANK_DEPOSIT_SUCCESS")
        {
            output_string = output_string.replace("%d", this.data.bank.deposit_interest_rate);
        }
        var outer_border_style = `
            background: linear-gradient(172deg, #000000, #373737);
            padding: 4px; border-radius: 4px; max-width: fit-content;
            display: grid; grid-gap: 10px;
        `;
        var inner_text_style = `
            background: #0c2b6c; padding: 6px; max-width: 300px;
            max-height: 200px; overflow: auto; border: 1px solid black;`;
        html += `
        <div id="bank" style="max-width: fit-content; position: absolute; top: 0px;">
            <div style="${outer_border_style}">
                <div id="bank_dialog" style="${inner_text_style}">${output_string}</div>
                <div id="bank_input">
                    <div>Gold: <input type="number" id="bank_input_number" min="1" max="10000" /></div>
                    <div>Your Gold: <span id="bank_your_gold">${wasm.exports.get_player_gold(0)}</span></div>
                </div>
                <div id="bank_info">
                    <div>Current Loan: <span id="bank_current_loan">${this.data.bank.loan_amount}</span></div>
                    <div>Current Deposit: <span id="bank_current_deposit">${this.data.bank.deposit_amount}</span></div>
                </div>
                <div id="bank_actions">
                    <button class="green" onclick="UI_BANK.takeLoan();">Take Loan</button>
                    <button class="green" onclick="UI_BANK.deposit();">Deposit</button>
                    <button class="green" onclick="UI_BANK.payLoan();">Pay Loan</button>
                    <button class="green" onclick="UI_BANK.withdraw();">Withdraw</button>
                    <button class="red" onclick="UI_BANK.exit();">Cancel</button>
                </div>
            </div>
        </div>
        `;
        document.getElementById("bank").outerHTML = html;
    },
    exit: function ()
    {
        document.getElementById("bank").outerHTML = `<div id="bank"></div>`;
        wasm.exports.current_scene_take_action(GAME_STRINGS.indexOf("ACTION_EXIT"));
        this.initialized = false;
    },
};