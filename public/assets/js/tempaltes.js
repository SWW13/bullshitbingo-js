
if (!!!templates) var templates = {};
templates["create-game"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);t.b("    <h2>Create new game</h2>");t.b("\n" + i);t.b("    <form>");t.b("\n" + i);t.b("        <div class=\"form-group\">");t.b("\n" + i);t.b("            <label for=\"username\">Username</label>");t.b("\n" + i);t.b("            <input type=\"text\" class=\"form-control\" id=\"username\" placeholder=\"username\" value=\"");t.b(t.v(t.f("username",c,p,0)));t.b("\">");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"form-group\">");t.b("\n" + i);t.b("            <label for=\"game\">Game Name</label>");t.b("\n" + i);t.b("            <input type=\"text\" class=\"form-control\" id=\"game\" placeholder=\"my awesome 💩\">");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"form-group\">");t.b("\n" + i);t.b("            <label class=\"sr-only\">Board Size (width x height)</label>");t.b("\n" + i);t.b("            <div class=\"input-group\">");t.b("\n" + i);t.b("                <input type=\"number\" min=\"3\" max=\"15\" class=\"form-control\" id=\"width\" placeholder=\"width\">");t.b("\n" + i);t.b("                <div class=\"input-group-addon\">╳</div>");t.b("\n" + i);t.b("                <input type=\"number\" min=\"3\" max=\"20\" class=\"form-control\" id=\"height\" placeholder=\"height\">");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <button type=\"submit\" class=\"btn btn-default\">Create new 💩bingo!</button>");t.b("\n" + i);t.b("    </form>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["game-list"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div>");t.b("\n" + i);t.b("    <h2>");t.b("\n" + i);t.b("        <i class=\"fa fa-gamepad\"></i>");t.b("\n" + i);t.b("        Current games");t.b("\n" + i);t.b("    </h2>");t.b("\n" + i);t.b("    <table class=\"table table-striped\">");t.b("\n" + i);t.b("        <thead>");t.b("\n" + i);t.b("        <tr>");t.b("\n" + i);t.b("            <th>Game</th>");t.b("\n" + i);t.b("            <th>Size</th>");t.b("\n" + i);t.b("            <th>Players</th>");t.b("\n" + i);t.b("            <th>Stage</th>");t.b("\n" + i);t.b("            <th>Words</th>");t.b("\n" + i);t.b("        </tr>");t.b("\n" + i);t.b("        </thead>");t.b("\n" + i);t.b("        <tbody>");t.b("\n" + i);if(t.s(t.f("games",c,p,1),c,p,0,354,654,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        <tr>");t.b("\n" + i);t.b("            <td>");t.b("\n" + i);t.b("                <a class=\"button-join\" href=\"#\" data-id=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b(t.v(t.f("name",c,p,0)));t.b("</a>");t.b("\n" + i);t.b("            </td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.f("width",c,p,0)));t.b("╳");t.b(t.v(t.f("height",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.d("players.length",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.f("stage",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("            <td>");t.b(t.v(t.d("words.length",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("        </tr>");t.b("\n" + i);});c.pop();}t.b("        </tbody>");t.b("\n" + i);t.b("    </table>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});if (!!!templates) var templates = {};
templates["word-list"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"panel panel-default\">");t.b("\n" + i);t.b("    <div class=\"panel-heading\">");t.b("\n" + i);t.b("        <h3 class=\"panel-title\">Wordlist</h3>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"panel-body\">");t.b("\n" + i);if(t.s(t.f("words",c,p,1),c,p,0,170,398,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <div class=\"col-sm-2\">");t.b("\n" + i);t.b("                ");t.b(t.v(t.d(".",c,p,0)));t.b("\n" + i);t.b("                <a class=\"button-delete\" href=\"#\" data-word=\"");t.b(t.v(t.f("word",c,p,0)));t.b("\">");t.b("\n" + i);t.b("                    <i class=\"fa fa-trash-o\"></i>");t.b("\n" + i);t.b("                </a>");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);});c.pop();}t.b("    </div>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div>");t.b("\n" + i);t.b("    <h2>");t.b("\n" + i);t.b("        Wordlist");t.b("\n" + i);t.b("    </h2>");t.b("\n" + i);t.b("    <table id=\"wordlist\" class=\"table table-striped\">");t.b("\n" + i);t.b("        <tbody>");t.b("\n" + i);if(t.s(t.f("words",c,p,1),c,p,0,557,883,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        <tr>");t.b("\n" + i);t.b("            <td>");t.b("\n" + i);t.b("                ");t.b(t.v(t.f("name",c,p,0)));t.b("\n" + i);t.b("                <span class=\"badge\">");t.b(t.v(t.f("user",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("            </td>");t.b("\n" + i);t.b("            <td>");t.b("\n" + i);t.b("                <a class=\"button-delete\" href=\"#\" data-word=\"");t.b(t.v(t.f("word",c,p,0)));t.b("\">");t.b("\n" + i);t.b("                    <i class=\"fa fa-trash-o\"></i>");t.b("\n" + i);t.b("                </a>");t.b("\n" + i);t.b("            </td>");t.b("\n" + i);t.b("        </tr>");t.b("\n" + i);});c.pop();}t.b("        </tbody>");t.b("\n" + i);t.b("    </table>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});