
if (!!!templates) var templates = {};
templates["bingo-board-overview"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("players",c,p,1),c,p,0,12,357,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<div class=\"board-other-container\">");t.b("\n" + i);t.b("    ");t.b(t.v(t.f("name",c,p,0)));t.b("\n" + i);t.b("    <table class=\"board-other\" class=\"table table-bordered\">");t.b("\n" + i);t.b("        <tbody>");t.b("\n" + i);if(t.s(t.f("lines",c,p,1),c,p,0,157,309,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        <tr>");t.b("\n" + i);if(t.s(t.d(".",c,p,1),c,p,0,189,280,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <td class=\"bg-");t.b(t.v(t.f("css_class",c,p,0)));t.b("\">");t.b("\n" + i);t.b("                ╳");t.b("\n" + i);t.b("            </td>");t.b("\n" + i);});c.pop();}t.b("        </tr>");t.b("\n" + i);});c.pop();}t.b("        </tbody>");t.b("\n" + i);t.b("    </table>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["bingo-board"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);t.b("    <h2>");t.b("\n" + i);t.b("        💩bingo Board");t.b("\n" + i);t.b("    </h2>");t.b("\n");t.b("\n" + i);t.b("    <table id=\"board\" class=\"table table-bordered\">");t.b("\n" + i);t.b("        <tbody>");t.b("\n" + i);if(t.s(t.f("lines",c,p,1),c,p,0,134,433,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        <tr>");t.b("\n" + i);if(t.s(t.d(".",c,p,1),c,p,0,166,404,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <td class=\"bg-");t.b(t.v(t.f("css_other_class",c,p,0)));t.b("\">");t.b("\n" + i);t.b("                <button type=\"button\" class=\"btn btn-");t.b(t.v(t.f("css_class",c,p,0)));t.b(" button-buzzWord\" data-id=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("                    ");t.b(t.t(t.f("word",c,p,0)));t.b("\n" + i);t.b("                </button>");t.b("\n" + i);t.b("            </td>");t.b("\n" + i);});c.pop();}t.b("        </tr>");t.b("\n" + i);});c.pop();}t.b("        </tbody>");t.b("\n" + i);t.b("    </table>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<div>");t.b("\n" + i);t.b("    <h2>");t.b("\n" + i);t.b("        Users Overview");t.b("\n" + i);t.b("    </h2>");t.b("\n");t.b("\n" + i);t.b("    <div id=\"board-other\" class=\"board-other-container\"></div>");t.b("\n");t.b("\n" + i);t.b("    <div class=\"clearfix\"></div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["chat-row-log"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"col-md-12\">");t.b("\n" + i);t.b("        <span class=\"chat-time\">");t.b("\n" + i);t.b("            <i>");t.b(t.v(t.f("time",c,p,0)));t.b("</i>");t.b("\n" + i);t.b("        </span>");t.b("\n" + i);t.b("        <span class=\"chat-log\">");t.b("\n" + i);t.b("            <i>");t.b(t.t(t.f("message",c,p,0)));t.b("</i>");t.b("\n" + i);t.b("        </span>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["chat-row"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"col-lg-3 col-md-3 col-sm-4 col-xs-6\">");t.b("\n" + i);t.b("        <span class=\"chat-time\">");t.b("\n" + i);t.b("            ");t.b(t.v(t.f("time",c,p,0)));t.b("\n" + i);t.b("        </span>");t.b("\n" + i);t.b("        <span class=\"chat-username pull-right\">");t.b("\n" + i);t.b("            &lt;");t.b(t.v(t.f("username",c,p,0)));t.b("&gt;");t.b("\n" + i);t.b("        </span>");t.b("\n" + i);t.b("    </div>");t.b("\n");t.b("\n" + i);t.b("    <div class=\"col-lg-9 col-md-9 col-sm-8 col-xs-6\">");t.b("\n" + i);t.b("        <span class=\"chat-message\">");t.b("\n" + i);t.b("            ");t.b(t.t(t.f("message",c,p,0)));t.b("\n" + i);t.b("        </span>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["connecting"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"panel panel-default\">");t.b("\n" + i);t.b("    <div class=\"panel-heading\">");t.b("\n" + i);t.b("        <h3 class=\"panel-title\">Connecting to server</h3>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"panel-body\">");t.b("\n" + i);t.b("        please wait...");t.b("\n" + i);t.b("        <i class=\"fa fa-spinner fa-spin fa-lg\"></i>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);if(t.s(t.f("error",c,p,1),c,p,0,264,478,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("    <div class=\"panel-footer\">");t.b("\n" + i);t.b("        <div class=\"alert alert-danger\" role=\"alert\">");t.b("\n" + i);t.b("            Code: <span class=\"label label-danger\">");t.b(t.v(t.f("code",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("            Reason: ");t.b(t.v(t.f("reason",c,p,0)));t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);});c.pop();}t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["create-game"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);t.b("    <h2>Create new game</h2>");t.b("\n");t.b("\n" + i);t.b("    <form id=\"create-game\" name=\"game\">");t.b("\n" + i);t.b("        <div class=\"form-group\">");t.b("\n" + i);t.b("            <label for=\"game-name\">Game Name</label>");t.b("\n" + i);t.b("            <input id=\"game-name\" name=\"name\" type=\"text\" class=\"form-control\" placeholder=\"my awesome 💩\" required>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"form-group\">");t.b("\n" + i);t.b("            <label for=\"game-size\">Board Size (width ╳ height)</label>");t.b("\n" + i);t.b("            <select id=\"game-size\" class=\"form-control\">");t.b("\n" + i);t.b("                <option value=\"3\">3 ╳ 3</option>");t.b("\n" + i);t.b("                <option value=\"4\">4 ╳ 4</option>");t.b("\n" + i);t.b("                <option value=\"5\" selected>5 ╳ 5</option>");t.b("\n" + i);t.b("                <option value=\"6\">6 ╳ 6</option>");t.b("\n" + i);t.b("                <option value=\"7\">7 ╳ 7</option>");t.b("\n" + i);t.b("                <option value=\"8\">8 ╳ 8</option>");t.b("\n" + i);t.b("                <option value=\"9\">9 ╳ 9</option>");t.b("\n" + i);t.b("                <option value=\"10\">10 ╳ 10</option>");t.b("\n" + i);t.b("            </select>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <button id=\"game-create\" type=\"submit\" class=\"btn btn-default\">Create new 💩bingo!</button>");t.b("\n" + i);t.b("    </form>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["game-list"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div id=\"game-list\">");t.b("\n" + i);t.b("    <h2>");t.b("\n" + i);t.b("        <i class=\"fa fa-gamepad\"></i>");t.b("\n" + i);t.b("        Current games");t.b("\n" + i);t.b("    </h2>");t.b("\n");t.b("\n" + i);t.b("    <table class=\"table table-striped\">");t.b("\n" + i);t.b("        <thead>");t.b("\n" + i);t.b("        <tr>");t.b("\n" + i);t.b("            <th>Game</th>");t.b("\n" + i);t.b("            <th>Size</th>");t.b("\n" + i);t.b("            <th>Players</th>");t.b("\n" + i);t.b("            <th>Stage</th>");t.b("\n" + i);t.b("            <th>Words</th>");t.b("\n" + i);t.b("            <th>User</th>");t.b("\n" + i);t.b("        </tr>");t.b("\n" + i);t.b("        </thead>");t.b("\n" + i);t.b("        <tbody>");t.b("\n" + i);if(t.s(t.f("games",c,p,1),c,p,0,396,711,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        <tr>");t.b("\n" + i);t.b("            <td>");t.b("\n" + i);t.b("                <a class=\"button-join\" href=\"#\" data-id=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b(t.t(t.f("name",c,p,0)));t.b("</a>");t.b("\n" + i);t.b("            </td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.f("size",c,p,0)));t.b("╳");t.b(t.v(t.f("size",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.f("players",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.f("stage",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.f("words",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.f("user",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("        </tr>");t.b("\n" + i);});c.pop();}t.b("        </tbody>");t.b("\n" + i);t.b("    </table>");t.b("\n");t.b("\n" + i);if(!t.s(t.f("games",c,p,1),c,p,1,0,0,"")){t.b("    <div class=\"well\">no games, feel free to create a new one</div>");t.b("\n" + i);};t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["last-words"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("last_words",c,p,1),c,p,0,15,192,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<span style=\"margin-right: 35px;\">");t.b("\n" + i);t.b("    ");t.b(t.t(t.f("word",c,p,0)));t.b("\n" + i);t.b("    <a class=\"button-addLastWord\" href=\"#\" data-word=\"");t.b(t.t(t.f("word",c,p,0)));t.b("\">");t.b("\n" + i);t.b("        <i class=\"fa fa-plus-square\"></i>");t.b("\n" + i);t.b("    </a>");t.b("\n" + i);t.b("</span>");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["navbar-right"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<li>");t.b("\n" + i);t.b("    <a id=\"edit-username\" href=\"#\">");t.b("\n" + i);t.b("        <i class=\"fa fa-user\"></i>");t.b("\n" + i);t.b("        ");t.b(t.v(t.f("username",c,p,0)));t.b("\n" + i);t.b("        ");if(!t.s(t.f("username",c,p,1),c,p,1,0,0,"")){t.b("Unknown Player");};t.b("\n" + i);t.b("    </a>");t.b("\n" + i);t.b("</li>");t.b("\n" + i);t.b("<li>");t.b("\n" + i);t.b("    <a href=\"#chat-form\">");t.b("\n" + i);t.b("        <i class=\"fa fa-envelope\"></i>");t.b("\n" + i);t.b("        <span class=\"badge\">");t.b(t.v(t.f("unread",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("    </a>");t.b("\n" + i);t.b("</li>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["navbar"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("game",c,p,1),c,p,0,9,136,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<li class=\"active hidden-xs\">");t.b("\n" + i);t.b("    <a href=\"#content\">");t.b("\n" + i);t.b("        <i class=\"fa fa-gamepad\"></i>");t.b("\n" + i);t.b("        ");t.b(t.t(t.f("name",c,p,0)));t.b("\n" + i);t.b("    </a>");t.b("\n" + i);t.b("</li>");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["won"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);t.b("    <h2>");t.b("\n" + i);t.b("        <i class=\"fa fa-trophy\"></i> ");t.b(t.v(t.f("name",c,p,0)));t.b(" has won!");t.b("\n" + i);t.b("    </h2>");t.b("\n");t.b("\n" + i);t.b("    <table id=\"board-won\" class=\"table table-bordered\">");t.b("\n" + i);t.b("        <tbody>");t.b("\n" + i);if(t.s(t.f("lines",c,p,1),c,p,0,171,332,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        <tr>");t.b("\n" + i);if(t.s(t.d(".",c,p,1),c,p,0,203,303,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <td class=\"bg-");t.b(t.v(t.f("css_class",c,p,0)));t.b("\">");t.b("\n" + i);t.b("                ");t.b(t.t(t.f("word",c,p,0)));t.b("\n" + i);t.b("            </td>");t.b("\n" + i);});c.pop();}t.b("        </tr>");t.b("\n" + i);});c.pop();}t.b("        </tbody>");t.b("\n" + i);t.b("    </table>");t.b("\n");t.b("\n" + i);t.b("    <p>");t.b("\n" + i);t.b("        <a id=\"go-back\" href=\"#\">Go back</a>");t.b("\n" + i);t.b("    </p>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["wordlist"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<tbody>");t.b("\n" + i);if(t.s(t.f("words",c,p,1),c,p,0,18,255,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<tr>");t.b("\n" + i);t.b("    <td>");t.b("\n" + i);t.b("        ");t.b(t.t(t.f("word",c,p,0)));t.b("\n" + i);t.b("        <span class=\"badge\">");t.b(t.v(t.d("user.name",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("    </td>");t.b("\n" + i);t.b("    <td>");t.b("\n" + i);t.b("        <a class=\"button-removeWord\" href=\"#\" data-id=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("            <i class=\"fa fa-trash-o\"></i>");t.b("\n" + i);t.b("        </a>");t.b("\n" + i);t.b("    </td>");t.b("\n" + i);t.b("</tr>");t.b("\n" + i);});c.pop();}t.b("</tbody>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["words"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);t.b("    <h2>");t.b("\n" + i);t.b("        Wordlist");t.b("\n" + i);t.b("        <small id=\"wordlist-count\"></small>");t.b("\n" + i);t.b("    </h2>");t.b("\n" + i);t.b("    <table id=\"wordlist-table\" class=\"table table-striped\"></table>");t.b("\n" + i);t.b("    <div>");t.b("\n" + i);t.b("        <form id=\"wordlist-form\" class=\"form-horizontal\">");t.b("\n" + i);t.b("            <div class=\"row\">");t.b("\n" + i);t.b("                <div class=\"col-xs-10\">");t.b("\n" + i);t.b("                    <input type=\"text\" class=\"form-control\" id=\"word\" placeholder=\"new word\" autocomplete=\"off\" required=\"required\">");t.b("\n" + i);t.b("                </div>");t.b("\n" + i);t.b("                <div class=\"col-xs-2\">");t.b("\n" + i);t.b("                    <button id=\"wordlist-add\" type=\"submit\" class=\"btn btn-default\">💩</button>");t.b("\n" + i);t.b("                </div>");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("        </form>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div>");t.b("\n" + i);t.b("        <h3>Last Words</h3>");t.b("\n");t.b("\n" + i);t.b("        <div id=\"last-words\" class=\"panel-body\"></div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});