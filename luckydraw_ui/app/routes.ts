// import {
//   type RouteConfig,
//   route,
//   index,
//   layout,
//   prefix,
// } from "@react-router/dev/routes";

// export default [
//   index("./routes/home.tsx"),
//   layout("./auth/layout.tsx", [route("login", "./auth/.tsx")]),

//   // ...prefix("concerts", [
//   //   index("./concerts/home.tsx"),
//   //   route(":city", "./concerts/city.tsx"),
//   //   route("trending", "./concerts/trending.tsx"),
//   // ]),
// ] satisfies RouteConfig;

import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  // index("./routes/home.tsx"),
  layout("./auth/layout.tsx", [index("./routes/login.tsx")]),
  ...prefix("admin", [
    layout("./admin/layout.tsx", [
      index("./routes/user-management.tsx"),
      route("/user-details/:id", "./routes/user-details.tsx"),
      route("/draws", "./routes/admin/drawlist.tsx"),
      route("/draws/new", "./routes/admin/draw-form.tsx"),
      route("/draws/:id", "./routes/admin/draw.tsx"),
      route("/history", "./routes/admin/history.tsx"),
    ]),
  ]),
  ...prefix("participant", [
    layout("./participant/layout.tsx", [
      index("./routes/participant/home.tsx"),
      route("/draws/:id", "./routes/participant/draw.tsx"),
      route("/profile", "./routes/participant/profile.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
