const Telegraf = require('telegraf');
const Markup = require("telegraf/markup");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");

const Converter = require("./api/currency-converter"); 

const bot =  new Telegraf('1425109392:AAF9iqZJ1fReGqxZqlblLNM6m2rQcqPKTF4')
bot.start((ctx) => 
    ctx.reply(`Hi, can I help you, ${ctx.from.first_name}?`,
    
            Markup.inlineKeyboard([
                Markup.callbackButton("Convert Currency", "CONVERT_CURRENCY"),
                Markup.callbackButton("View Rates", "VIEW_RATES")
            ]).extra()
        )
    );

    // Go back to menu after action
bot.action("BACK", ctx => {
    ctx.reply(`Glad I could help`);
    ctx.reply(
      `Do you need something else, ${ctx.from.first_name}?`,
        Markup.inlineKeyboard([
        Markup.callbackButton("💱 Convert Currency", "CONVERT_CURRENCY"),
        Markup.callbackButton("🤑 View Rates", "VIEW_RATES")
      ]).extra()
    );
  });

const currencyConverter = new WizardScene(
    "currency_converter",
    ctx => {
        ctx.reply("Type in currency to convert from (example: MYR/USD/AUD)");
        return ctx.wizard.next();
    },
    ctx => {
        ctx.wizard.state.currencySource = ctx.message.text;
        ctx.reply(
            `Got it, you wish to convert from ${
                ctx.wizard.state.currencySource
              } to what currency? (example: MYR/USD/AUD)`
        );
        return ctx.wizard.next();
    },
    ctx => {
        ctx.wizard.state.currencyDestination = ctx.message.text;
        ctx.reply(
          `Enter the amount to convert from ${ctx.wizard.state.currencySource} to ${
            ctx.wizard.state.currencyDestination
          }`
        );
        return ctx.wizard.next();
      },
      ctx => {
        const amt = (ctx.wizard.state.amount = ctx.message.text);
        const source = ctx.wizard.state.currencySource;
        const dest = ctx.wizard.state.currencyDestination;
        const rates = Converter.getRate(source, dest);
        rates.then(res => {
          let newAmount = Object.values(res.data)[0] * amt;
          newAmount = newAmount.toFixed(3).toString();
          ctx.reply(
            `${amt} ${source} is equivalent \n${newAmount} ${dest}`,
            Markup.inlineKeyboard([
              Markup.callbackButton("🔙 Back to Menu", "BACK"),
              Markup.callbackButton(
                "💱 Convert Another Currency",
                "CONVERT_CURRENCY"
              )
            ]).extra()
          );
        });
        return ctx.scene.leave();
      }
    );
    
    // Scene registration
    const stage = new Stage([currencyConverter], { default: "currency_converter" });
    bot.use(session());
    bot.use(stage.middleware());
bot.startPolling();
