import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://dfhkdyypyqxbqitwuphx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaGtkeXlweXF4YnFpdHd1cGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzMyMDgsImV4cCI6MjA5NTA0OTIwOH0.Gzm35ojyujuj5h3g-TJFakcKsqWuDoDkI4Mpxq3ifQA";
const BRANCHES = ["Campinas", "Vila Nova SP"];
const LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QDsRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAC5ADAAIAAAAUAAAApJAEAAIAAAAUAAAAuJAQAAIAAAAHAAAAzJARAAIAAAAHAAAA1JASAAIAAAAHAAAA3JKQAAIAAAAEMDAwAJKRAAIAAAAEMDAwAJKSAAIAAAAEMDAwAKABAAMAAAABAAEAAKACAAQAAAABAAACpaADAAQAAAABAAAChwAAAAAyMDI2OjA1OjI1IDE4OjI1OjEwADIwMjY6MDU6MjUgMTg6MjU6MTAALTAzOjAwAAAtMDM6MDAAAC0wMzowMAAA/+0AfFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAABEHAFaAAMbJUccAgAAAgACHAI/AAYxODI1MTAcAj4ACDIwMjYwNTI1HAI3AAgyMDI2MDUyNRwCPAALMTgyNTEwLTAzMDA4QklNBCUAAAAAABAtWN7ZOQWfoEiImjUvDVMU/8IAEQgChwKlAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAICAgICAgMCAgMFAwMDBQYFBQUFBggGBgYGBggKCAgICAgICgoKCgoKCgoMDAwMDAwODg4ODg8PDw8PDw8PDw//2wBDAQIDAwQEBAcEBAcQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/2gAMAwEAAhEDEQAAAfhnbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bW1lacruq0/K7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXK7qtXL7pKeVntrLbattq22rbattq22rbOKcekKeXrOs110us1TTzNU08zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPU8zPSvMz1PMz1PMz0zzM9K8zPU8zPU8zPTPMz1PMz1PMz0tH5769R3J5vtrzdtq22rbattq22rOmr69A2Sm9YiU6iJToqydSsnUrJ1KydSsHUbB1GwdRsHUbB1GwdRsHUbB1GwdRsHUbB1GwdRsHUbB1GwdRsHUbB1Gw9MrJSqESMdmZLdvc1gSrIyWmCq7iYenJg6jYOo2DqNg6jYOpuNw3vB22ubbattq22rbas+Yvr1yJyb3VJ2m22l22pSVJm2UmXbaslWWyVaZOUmtsmlbatk6lbJlVtpttq22rbattq22rbaspKmkq2rZOrKHlyzcwbAacluIg9o7bSOnDN4vobbXXttW21bbVttW21DbuG7fN7bXm7bVttW21bbVnzF5eurbXt7bVttW2VMnbVlbUnKTW20u21bbVkq1bbVspKttsy7bVkq1J21bbVttW21bbUlWTBQxt15nAxpbEmHrIiU6Kk7S7ZVJyjRzrZfS22bXbaXbattq22rbahtXTW8BW2vM22rbattq22rPGby9dWyr207a022s1JUlW2ypk5WrJ2aVkqVU7Zm22rbattq2SpV2TmVWTqVsmlJyaVtq22rbatk5bBUNcBjUnTh22hslUNtq22rbaKnDd0vQRWzehttLttW21bbVttW21Daumt4CtteZttW21bbVttWeM316+UlS+7ttWydSslVbbVttW21bbVttW21bbVttWSpNJ20u21bbVttSdtW21bbVlJ1DCRNxpGRNgNKkybbNnttW21ZSVViD07w1e6XtJtrq22rbattq22rbahhMFvnttrzttq22rbattqzxm8vXVtl9vbattq22rbattq22rbattq22rbattmslSVtlaVO2rbattqydq22rbaslSYBTtcW21DGYdkNWS2G21K21bbTKTtSnDc1q4UlS+lttHbattq22rbahhMFvA22vO22rbattq22rPGby9dW2X2dtq22rbattq22rbattq22rbattq22rbakpVqTlak5WpOVqHiah5SaUlWrDw1xTh5uQidqUMmpukyWxTsmRWSqtlaZOUmlOmrpehRBqu1Sdp9tqyk6tlJrbakhMFvA22vO22rbattq22rPGbq9UiU5fbJh6iYeaJh6iYeomHqJh6iYeomHqJh6iYeomHqJh6iYeomHqJh6iYeomHqVk6lJ2WCMwV5Q5SW5FKGSbba1wSJsB5WbJSspdxpMGzUnZkzxq8XqVtru22rbattq2yayUjuUidm8bba5Ntq22rbattqzpq6vVSlQ19YigmrbZn22rbattq22rbattq22rbattq22rbZbbattmttq2yaVk5ZWTqS3UlePKSplTtobbRyVah4mkGpKoqbkTZJVs2RHjN0voK211bZKorJ06ttWSobIPZLcitteVttcm21bbVttW21Z01cXqpGpN34wSKxNs3RttWTkrEw1QVto7bVttW21bbVttW21JSlNkQgT12/D+0eLw2ybbZOk2yp07KVGqXAW49k6VWSqttp9tq2TpVJUmhp2bnVsqlPAmX0MnJmUPJsSKGS32Uldckg2yGlSW5lZOvIVtrm22rbattq22pJEhu4yR5e0hG+pxm+mcZvfS1KfqK6bP5D31V8zzV+b/SSt8676Y+ZaUn6io7P57zdVsbfSjGw+ec3Tbus3TThI9KYzNde3+L+weL062DdbhIRyuFN9K4wVTKGpMo9tYq20221bbQSrJipKtQUqzYZWUrGUEdsbB0pMPMpFByzjN9MbB0qsnMpFDJefttc221bbVttW21YanF6DXOEr3t1GJTfOtaq/Qz5x+ym8mv5f5N8zm/Tr5P8Aqb5psPk39Nvz1/SC08j+D/rL5TXq/S7h+y4VuH4F67m/pS9L62+X/pz89bz/ADfOMvqN1GVO1zhNk3Motev+O+zeMzJGTUlJNScpMVKSq0w1aUKSJslJUmOyVUpOVWGpNKVk1lZUE4iZh4mZRpNqDjJlTjKXRvnWtW6XSZGuJmxSRKrzdtrm22rbattq22rGCq9JQ1Ze/KTokSkk32x7Nx428T4J6bgfer0vtD4z+xvz1vP7T7e+W/piX4p8Z6Tmb0v0k4XsuDvN+I/vj4l/Ri6+N/Pv6K+b7VOVl3ykpmUnayUpKq9i8X9k8ZswqTmyyk6XKSmiKGa0IoardKVJU5KlUlLgME5Sa2UmiZOgpSdEiVa12TmVKk6z22pRBqtiJTl0InJlGkg251KSq8zba5ttq22rbattqSra7lZOvRVk6XXFP6dX3R4r7l8m3k/Of1x8j/el29x+b/3R8I2f3J3SeDub4fGNV6v6LcH2nn95nm/1l5emvj3m8m9JSh5XJk6bJVrNUIXN7D477F43IEZtYD2zKlWJSTKTdO20Uq2rZWpScRdGqtrDbKgnbVttaEw0wIoamtlJrbaO20NkqpSdo5O1mpSdcCttc221bbVttW21YJh3WnKTde20u+jPnX7Es/dvg37o/Omwo/YvH9dfo1HyftEv2p84/RXxncniatrv/QjmbzpLzX3x79afnjb1KSJutKtqySJpKlaI3CTK3rHkPrnkNKTtQ8pTIl41VP6VyfWcC3rdxwvWcWuDroObfLwdV3XjvQWXE+6eF3VvU+xeL9lZVfXee2FdExq2tPOs8/tomtOdU2HccWanXf2bw/tuJr6I+c+64Vk9w8V67maZ91yvVXpPODcdJNw6Va81SkkuDbaw22rbattq22rJUm68na7U7aVX2J8d+nS/cHw79sVNxfnnus5G70/Unyz9uXN6t+fv3N+e8rXYl3fendcT2V5PiPx/655Hd+21spO1ZKkykySWqogit6p5H615G2KslSnZSWXbabvOfskt6rpiR0rULy4p7PV95z9laOsa3a0PQOLNXI2zGyY2TO+XLmclLcnVcz6Nwt3Xjh4O66l1X2lnz9xk08pekbtpVqsKezp/RvOfSFXzVJB3nKIMlxbbXNttW21bbVttWGQd17ZV2pSpMqttN7t9Wfm79GXJ7h8P/oN8x2fz3+hXwz99V5v8U/TnzHdO7LjfpSb6OIzNeX8R+c+i+dXr7bQ2SqslSq2Sq2xAmXP1TyX1bymCVbQ22ZsRJF1vL7ke4b0OPuuZ6KyuOdeOrVrR9JmbUt5Qqu6rl3lB5n07gbA1hYGZ+Pr+049fP9C5+0G3qKwyRo7Slul57KnsKu6bSvsq2W45u+pWWj9E879AXPz9OVcGUlVwbbXNttW21bbVttWGQN1qyddeSrSq31A1VfmnvOD9qZvrT5Z+oPiW4ug+wPnX6Cr5N8b6rlb0DfeXyf8AZlx+d+nfLf09YfFvnPo3nd6KcpM+Vkx2yZCZKlZJguK9O8p9W8phtkwVkqaJlDXocdpxPTN0UN5S9FLR9dy9pak5vqubmvKt44qvVaBprW9BydndWwVWlTQ9VytydFYNW90uHSiNpzNs6arm1sKO4ozO4Z2lTYcr2lhy/TWHFz1eSq8pRBkuTba5ttq22rbattqwTBunba69ZVfoEv2Z5T65833F8/8A098x/aF09x8D/ZnxTJ9fdw15Ox+Pw55el9Nd9aeK3n+f/Ynx79fV8b+b+lea3WRKdakTk0oZByEydRFJhdfVfK/TvL5U7ZkxBmtU7JWxBplIZnmyfJDl6XjcOaM4Yqp83DqdM86laq6jXNzoeq5tdEjybUxGuqwbt9ThIVU6G3VNlJSyGDlRCrKssRKri22sNtq22rbattqwyBunbKutPunhf1FY+0fHf1x8N2TH7s+NftavH/n30intfrTwn3b5VsPJfVvJ/rK6fWPif6q+KbD1D62+T/qqX5D819I81ulWSqbbatsmlZKpiK2V/SvMfTvMZE7ZrOAkXVKVJlTsmySrKaJsldNtqVtmfbZQm2pc3P7lX+R6T2jy2rHPslS6bbTbbVttSkqTW21JUlTKlSdSiDJcm21zbbVttW21bbVgmDdO21176u+UfYrD6W+OfsZVzeM+zN/AY+Z+sfP/ANYW3p3xP9ffEMtl9vfOf0dL4n859pxdt7B9QfMv0tc/yb5r6V5rde20221bbVttRk7Lr6V5n6V5rZJ2IzKTsrJSrUkZBtjjBJMROy6bbMVJVlsnDZNkqsclWrKGS0yk5WVtq22rbatsqk7akrhTQVZVKVtcm21zbbVttW21bbVgmDdO2105N4+l1wxZyM6XriVxvSKdTsed7qjkHYV9LFSeoeTc7eDDLTs0qtNtq2TqUnKrKGZbba19I819I83sFKTrbJ2lyVJlHlZl22lJh60Jh6jJHpclSZMrJipO1Yg9MpWyyttabbVttW21K21bbTDIlTLlJVcW21httW21bbVttWCYd0p2TdPRWlG+suya8Ozp90zOtj3FTzJquOHuKeu05XqK2Hdc3W83XpnE3nOz1asqZKSak5WpKSDpS4WrRkqr0Tzn0TzuVKsmlbJrJUll22l22rbattq22rbatk6ttq22pRBkW22tttq22rbaspOpSh5pWTqUpKri22sNtq22rbattqwyBt07a6dtqVk6lZOpW2rKGqlbasrKtBpUmXECSlZOmVk6XDUmVRgmXQakqZfQPPfQPP6ydlVJE5pOyqTtpNtqyVJirbVttWyVUnKyycrUlWSyKIMivttabK1Jyk1srUlKs1ttWydSiDJcm21httW21bbVttWCYNunKTdO21bbURSdNttSdtKrbTbbVkkTSVJVLtlTJSRNDVtLjBNaDUlK59JzqdBSVJjspLW2TSk5VJSrWO2TBW2myVZRttW21bbNbbUpSVLpttaK20u21JykzZOSy7bVttRCDJcm21lttW21bbVttWCYNvttb7bVkqVNlJ0yh7S7bVsrUkgyVkqTWUMlbbTbbSpTtWIlVJSrKo8pLMrZVZO1KGZNJVtScpUgcpNnttHbattq22rbattqUpKl0Vk60Vk6lJ2rbaVOVmVOVpk5WrEGS5NtrLbattq22rbasEwbfKTrbZSaVk6dWTq2UmTbKrZOnykqpSdqSQZKyk6slSaySahkylYeyWzVlKmHlahqyq22pKkqpJBkmGMw7JOUmTbattq22rbattqUpKlfbaO2VSdtScrMyVZMqttW21YgyXNttZbbVttW21bbVhkDbqSrW2SrQTsq0Ttq2UmTbaXKTqVkqtVJUmkkGStk6lKGSZSclWJh6lJUmzykppOVmsoaqUnasrahkSqRQyJXUeUls9lKoeImQeJqGpWoeVqSRKqySDtcrKVU7aslSWttq22rbalEGS5ttrLbattq22rbasMg7fbJtNlaspKp05SZk5Wsk7KhttSVZU6crTjVlSZOJOlScsrZNKTtSVJzLtkybK1JUlVZW0+2y221K20yRmGyJVtSsnRyVabbaVKtqSRKlslSZspOZcrJrJIOTZWpOVqTlasRKrHbay22rbattq22rDIO2Sra022pKsmlZOhlJVHbattq22ipKkzJVkyK2TFW2httDbaZSdqyk6dSdpNsqdKVKkSpSVdSdq22pScqk7ZpKtqTlZbbattq22rbZrJVqTtobJVZ7bR22rbalKSqy22sttq22rbattqwyDtdtrXbak5WpOVqTiJpKtq22rbatto7bQ2UmG2TFWSqkqTrNWTrRWSqG21ZSdMrJ1KTtW21bbS7bRVk6KttW2yvttW20m2TSk7NbbVtk1ttZq20+ytSdtSlJVZbbWW21bbVttW21ZKk2u2Ta7bVsrVttWSrUlSVVkq1JytW21JUlUE5KpNtrRKtrPZOpWyaVk6CsnUpQ1WislNKyVSZSdaKTtJttBKtrTbaspOpWTqVk6lZOpWToKyVRSlSZNtpFKGqbba022pSkqufbaXbattq22rbaslWt05SbTJIOCsrRTlJhsrUNW0NlaKdlUnbUnbVttZ7J0FZOrbaG21bbVttW21bbUpW1qnbR22rbattq22rbak5Ws8lSop2TStk0rJ1bbSbbVlJVPspM+21KUlVz7bS7bVttW21bbVtiUPE1oNJlShxkzJSRVDSZNBUZMo8RVBxkzDxNQc4TKHGVTXOtTXOk03zjU3U4TQcbUHOE0FLpNN841DxNQ0m1BzjU3xtKHG1BzjTN841N84TQc41N8bUFLpNN841N1OE0FLpNN84VTdRk0HGVQcpMu21bbVttW21bbVlJ1Ew9MTD05MPUTD1GSPUTD1Ew9Rkj1Ew9RMPUTD1Ew9RMPUTD1Ew9RMPUTD1Ew9RMPUTD1Ew9RMPUTD1Ew9RMPUTD1Ew9RMPUTD1Ew9RMPUTD1Ew9RMPUTD1Ew9IpO0u21bbVttW21bbVttW20220+20Ntq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22jttZbbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW2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";
const WINE = "#8B1A2B";
const WINE_DARK = "#3a0a10";
const WINE_LIGHT = "#b52a3a";
const CARD = "#1c1c1e";
const BG = "#000000";
const TEXT = "#ffffff";
const TEXT2 = "#8e8e93";
const BORDER = "#2c2c2e";

const db = async (path, opts = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
    },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : [];
};

const fmt = (n) => `R$ ${(n || 0).toFixed(2).replace(".", ",")}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString("pt-BR");

const S = {
  screen: { minHeight: "100vh", background: BG, color: TEXT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", paddingBottom: 80 },
  header: { padding: "16px 16px 8px", textAlign: "center", position: "relative" },
  headerTitle: { color: WINE, fontSize: 17, fontWeight: 600, letterSpacing: 0.3 },
  headerRight: { position: "absolute", right: 16, top: 16, display: "flex", gap: 8 },
  headerLeft: { position: "absolute", left: 16, top: 12 },
  backBtn: { width: 36, height: 36, borderRadius: "50%", background: CARD, border: "none", color: TEXT, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" },
  iconBtn: { padding: "6px 14px", borderRadius: 20, background: CARD, border: "none", color: TEXT, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 },
  section: { margin: "16px 16px 0" },
  sectionLabel: { fontSize: 13, color: TEXT2, marginBottom: 8, paddingLeft: 4 },
  card: { background: CARD, borderRadius: 14, overflow: "hidden" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${BORDER}` },
  rowLast: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" },
  rowLeft: { display: "flex", alignItems: "center", gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  rowTitle: { fontSize: 16, color: TEXT },
  rowSub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  rowRight: { color: TEXT2, fontSize: 16 },
  chevron: { color: TEXT2, fontSize: 16 },
  input: { width: "100%", padding: "13px 16px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, color: TEXT, fontSize: 16, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "13px 16px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, color: TEXT, fontSize: 16, outline: "none", boxSizing: "border-box", appearance: "none" },
  label: { fontSize: 13, color: TEXT2, marginBottom: 6, paddingLeft: 4, display: "block" },
  primaryBtn: { width: "100%", padding: 16, background: WINE, border: "none", borderRadius: 14, color: TEXT, fontSize: 17, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3 },
  secondaryBtn: { padding: "10px 20px", background: WINE_DARK, border: `1px solid ${WINE}`, borderRadius: 10, color: WINE, fontSize: 14, cursor: "pointer" },
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(28,28,30,0.95)", borderTop: `1px solid ${BORDER}`, backdropFilter: "blur(10px)", display: "flex", justifyContent: "space-around", padding: "8px 0 20px", zIndex: 100 },
  navItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 12px" },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, letterSpacing: 0.3 },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  searchBar: { display: "flex", alignItems: "center", background: CARD, borderRadius: 12, padding: "10px 14px", margin: "0 16px 16px", gap: 8 },
  searchInput: { flex: 1, background: "none", border: "none", color: TEXT, fontSize: 16, outline: "none" },
  toast: { position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", zIndex: 9999, padding: "12px 24px", borderRadius: 20, fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("produtos");
  const [screen, setScreen] = useState("list");
  const [wines, setWines] = useState([]);
  const [stock, setStock] = useState({});
  const [movements, setMovements] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const isAdmin = user?.role === "admin";
  const userBranch = user?.branch || BRANCHES[0];

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [wineData, stockData, movData, clientData, saleData, expData] = await Promise.all([
        db("wines?active=eq.true&order=name.asc"),
        db("stock?select=*"),
        isAdmin ? db("movements?order=created_at.desc&limit=300") : db(`movements?branch=eq.${encodeURIComponent(userBranch)}&order=created_at.desc&limit=100`),
        db("clients?order=name.asc"),
        isAdmin ? db("sales?order=created_at.desc&limit=300") : db(`sales?branch=eq.${encodeURIComponent(userBranch)}&order=created_at.desc&limit=100`),
        db("expenses?order=created_at.desc&limit=200"),
      ]);
      setWines(wineData);
      const sm = {};
      BRANCHES.forEach(b => { sm[b] = {}; });
      stockData.forEach(s => { if (sm[s.branch]) sm[s.branch][s.wine_id] = s.quantity; });
      setStock(sm);
      setMovements(movData);
      setClients(clientData);
      setSales(saleData);
      setExpenses(expData);
    } catch (e) { showToast("Erro ao carregar dados", false); }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogin = async () => {
    setLoginError("");
    try {
      const data = await db(`profiles?username=eq.${loginForm.username}&password=eq.${loginForm.password}`);
      if (!data.length) { setLoginError("Usuário ou senha incorretos."); return; }
      setUser(data[0]);
    } catch { setLoginError("Erro de conexão."); }
  };

  const goBack = () => { setScreen("list"); setSelected(null); };
  const navigate = (s, item = null) => { setScreen(s); setSelected(item); };

  if (!user) return <LoginScreen form={loginForm} setForm={setLoginForm} onLogin={handleLogin} error={loginError} />;

  const navItems = [
    { key: "produtos", icon: "🏷️", label: "Produtos" },
    { key: "vendas", icon: "🛒", label: "Vendas" },
    { key: "clientes", icon: "👤", label: "Clientes" },
    { key: "relatorios", icon: "📊", label: "Relatórios" },
    { key: "menu", icon: "☰", label: "Menu" },
  ];

  return (
    <div style={S.screen}>
      {toast && (
        <div style={{ ...S.toast, background: toast.ok ? "#1a3a1a" : "#3a1a1a", color: toast.ok ? "#4ade80" : "#f87171", border: `1px solid ${toast.ok ? "#4ade80" : "#f87171"}` }}>
          {toast.msg}
        </div>
      )}

      {tab === "produtos" && <ProdutosTab screen={screen} navigate={navigate} goBack={goBack} wines={wines} stock={stock} isAdmin={isAdmin} userBranch={userBranch} loadData={loadData} showToast={showToast} selected={selected} loading={loading} />}
      {tab === "vendas" && <VendasTab screen={screen} navigate={navigate} goBack={goBack} wines={wines} stock={stock} clients={clients} sales={sales} isAdmin={isAdmin} userBranch={userBranch} loadData={loadData} showToast={showToast} selected={selected} setStock={setStock} />}
      {tab === "clientes" && <ClientesTab screen={screen} navigate={navigate} goBack={goBack} clients={clients} sales={sales} loadData={loadData} showToast={showToast} selected={selected} />}
      {tab === "relatorios" && <RelatoriosTab wines={wines} stock={stock} sales={sales} movements={movements} expenses={expenses} clients={clients} isAdmin={isAdmin} userBranch={userBranch} screen={screen} navigate={navigate} goBack={goBack} selected={selected} loadData={loadData} showToast={showToast} />}
      {tab === "menu" && <MenuTab user={user} setUser={setUser} isAdmin={isAdmin} loadData={loadData} showToast={showToast} wines={wines} movements={movements} expenses={expenses} screen={screen} navigate={navigate} goBack={goBack} selected={selected} />}

      <div style={S.bottomNav}>
        {navItems.map(n => (
          <button key={n.key} onClick={() => { setTab(n.key); setScreen("list"); setSelected(null); }} style={S.navItem}>
            <span style={{ ...S.navIcon, filter: tab === n.key ? "none" : "grayscale(1) opacity(0.5)" }}>{n.icon}</span>
            <span style={{ ...S.navLabel, color: tab === n.key ? WINE : TEXT2 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({ form, setForm, onLogin, error }) {
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "-apple-system, sans-serif" }}>
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <img src={LOGO} alt="Vinhos do Mundo" style={{ width: 220, borderRadius: 16, marginBottom: 16 }} />
        <div style={{ fontSize: 14, color: TEXT2, marginTop: 4 }}>Controle de Estoque</div>
      </div>
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} onKeyDown={e => e.key === "Enter" && onLogin()} placeholder="Usuário" style={{ ...S.input, fontSize: 17 }} />
        <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && onLogin()} placeholder="Senha" style={{ ...S.input, fontSize: 17 }} />
        {error && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>{error}</div>}
        <button onClick={onLogin} style={{ ...S.primaryBtn, marginTop: 8 }}>Entrar</button>
      </div>
    </div>
  );
}

function ProdutosTab({ screen, navigate, goBack, wines, stock, isAdmin, userBranch, loadData, showToast, selected, loading }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", type: "Tinto", region: "", year: new Date().getFullYear(), price: "", cost: "" });
  const [movForm, setMovForm] = useState({ type: "Entrada", qty: 1, branch: userBranch, toBranch: "Campinas", obs: "" });

  const filtered = wines.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.type?.toLowerCase().includes(search.toLowerCase()));
  const grouped = filtered.reduce((acc, w) => { const k = w.name[0].toUpperCase(); if (!acc[k]) acc[k] = []; acc[k].push(w); return acc; }, {});

  const handleAddWine = async () => {
    if (!form.name.trim()) { showToast("Nome obrigatório", false); return; }
    try {
      const [nw] = await db("wines", { method: "POST", body: JSON.stringify({ name: form.name.trim(), type: form.type, region: form.region, year: parseInt(form.year), price: parseFloat(form.price) || 0, cost: parseFloat(form.cost) || 0 }) });
      for (const b of BRANCHES) await db("stock", { method: "POST", body: JSON.stringify({ wine_id: nw.id, branch: b, quantity: 0 }) });
      showToast("Rótulo cadastrado!");
      await loadData();
      goBack();
    } catch (e) { showToast("Erro ao cadastrar", false); }
  };

  const handleMovement = async () => {
    const wine = selected;
    if (!wine) return;
    const qty = parseInt(movForm.qty);
    const branch = isAdmin ? movForm.branch : userBranch;
    if (movForm.type === "Saída" && (stock[branch]?.[wine.id] || 0) < qty) { showToast("Estoque insuficiente", false); return; }
    if (movForm.type === "Transferência" && branch === movForm.toBranch) { showToast("Filiais iguais", false); return; }
    try {
      const cur = stock[branch]?.[wine.id] || 0;
      const newQty = movForm.type === "Entrada" ? cur + qty : cur - qty;
      await db("stock", { method: "POST", prefer: "resolution=merge-duplicates,return=representation", body: JSON.stringify({ wine_id: wine.id, branch, quantity: newQty }) });
      if (movForm.type === "Transferência") {
        const cur2 = stock[movForm.toBranch]?.[wine.id] || 0;
        await db("stock", { method: "POST", prefer: "resolution=merge-duplicates,return=representation", body: JSON.stringify({ wine_id: wine.id, branch: movForm.toBranch, quantity: cur2 + qty }) });
      }
      await db("movements", { method: "POST", body: JSON.stringify({ wine_id: wine.id, wine_name: wine.name, branch, to_branch: movForm.type === "Transferência" ? movForm.toBranch : null, type: movForm.type, quantity: qty, user_name: "admin", obs: movForm.obs || null }) });
      showToast(`${movForm.type} registrada!`);
      await loadData();
      goBack();
    } catch { showToast("Erro", false); }
  };

  if (screen === "novo_produto") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Produto</div>
        <div style={S.headerRight}><button style={S.iconBtn} onClick={handleAddWine}>Salvar</button></div>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={S.section}>
          <div style={S.sectionLabel}>Nome do Produto</div>
          <input placeholder="Nome do vinho" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={S.input} />
        </div>
        <div style={S.section}>
          <div style={S.sectionLabel}>Tipo e Região</div>
          <div style={S.card}>
            <div style={S.row}>
              <span style={{ color: TEXT }}>Tipo</span>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none" }}>
                {["Tinto", "Branco", "Rosé", "Espumante", "Sobremesa"].map(t => <option key={t} style={{ background: CARD }}>{t}</option>)}
              </select>
            </div>
            <div style={S.rowLast}>
              <span style={{ color: TEXT }}>Região/País</span>
              <input placeholder="Ex: Chile" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right" }} />
            </div>
          </div>
        </div>
        <div style={S.section}>
          <div style={S.sectionLabel}>Preços</div>
          <div style={S.card}>
            <div style={S.row}>
              <span style={{ color: TEXT }}>Custo (R$)</span>
              <input type="number" placeholder="0,00" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} style={{ background: "none", border: "none", color: TEXT2, fontSize: 15, outline: "none", textAlign: "right", width: 100 }} />
            </div>
            <div style={S.rowLast}>
              <span style={{ color: TEXT }}>Venda (R$)</span>
              <input type="number" placeholder="0,00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right", width: 100 }} />
            </div>
          </div>
        </div>
        <div style={S.section}>
          <div style={S.sectionLabel}>Safra</div>
          <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} style={S.input} />
        </div>
      </div>
    </div>
  );

  if (screen === "movimentacao" && selected) return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Movimentação</div>
        <div style={S.headerRight}><button style={S.iconBtn} onClick={handleMovement}>Salvar</button></div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Produto</div>
        <div style={S.card}>
          <div style={S.rowLast}>
            <div>
              <div style={{ color: TEXT, fontSize: 16 }}>{selected.name}</div>
              <div style={{ color: TEXT2, fontSize: 13 }}>{selected.year}</div>
            </div>
            <div style={{ color: WINE, fontSize: 15 }}>{fmt(selected.price)}</div>
          </div>
        </div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Tipo</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(isAdmin ? ["Entrada", "Saída", "Transferência"] : ["Entrada", "Saída"]).map(t => (
            <button key={t} onClick={() => setMovForm(f => ({ ...f, type: t }))} style={{ flex: 1, padding: "12px 8px", borderRadius: 12, border: `1px solid ${movForm.type === t ? WINE : BORDER}`, background: movForm.type === t ? WINE_DARK : CARD, color: movForm.type === t ? WINE : TEXT2, cursor: "pointer", fontSize: 14 }}>{t}</button>
          ))}
        </div>
      </div>
      {isAdmin && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Filial de Origem</div>
          <div style={S.card}>
            <div style={S.rowLast}>
              <span style={{ color: TEXT }}>Filial</span>
              <select value={movForm.branch} onChange={e => setMovForm(f => ({ ...f, branch: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none" }}>
                {BRANCHES.map(b => <option key={b} style={{ background: CARD }}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
      {movForm.type === "Transferência" && isAdmin && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Filial de Destino</div>
          <div style={S.card}>
            <div style={S.rowLast}>
              <span style={{ color: TEXT }}>Destino</span>
              <select value={movForm.toBranch} onChange={e => setMovForm(f => ({ ...f, toBranch: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none" }}>
                {BRANCHES.map(b => <option key={b} style={{ background: CARD }}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
      <div style={S.section}>
        <div style={S.sectionLabel}>Quantidade</div>
        <div style={S.card}>
          <div style={S.rowLast}>
            <span style={{ color: TEXT }}>Unidade</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setMovForm(f => ({ ...f, qty: Math.max(1, f.qty - 1) }))} style={{ width: 32, height: 32, borderRadius: "50%", background: WINE_DARK, border: `1px solid ${WINE}`, color: WINE, cursor: "pointer", fontSize: 18 }}>−</button>
              <span style={{ color: TEXT, fontSize: 18, minWidth: 32, textAlign: "center" }}>{movForm.qty}</span>
              <button onClick={() => setMovForm(f => ({ ...f, qty: f.qty + 1 }))} style={{ width: 32, height: 32, borderRadius: "50%", background: WINE, border: "none", color: TEXT, cursor: "pointer", fontSize: 18 }}>+</button>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: TEXT2, paddingLeft: 4 }}>
          Estoque atual: {stock[isAdmin ? movForm.branch : userBranch]?.[selected.id] || 0} un.
        </div>
      </div>
      <div style={{ ...S.section, marginTop: 16 }}>
        <input placeholder="Observação (opcional)" value={movForm.obs} onChange={e => setMovForm(f => ({ ...f, obs: e.target.value }))} style={S.input} />
      </div>
    </div>
  );

  if (screen === "produto_detail" && selected) {
    const branch = isAdmin ? BRANCHES[0] : userBranch;
    return (
      <div style={S.screen}>
        <div style={S.header}>
          <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
          <div style={S.headerTitle}>{selected.name}</div>
        </div>
        <div style={S.section}>
          <div style={S.card}>
            <div style={S.row}><span style={{ color: TEXT2 }}>Tipo</span><span style={{ color: TEXT }}>{selected.type}</span></div>
            <div style={S.row}><span style={{ color: TEXT2 }}>Região</span><span style={{ color: TEXT }}>{selected.region}</span></div>
            <div style={S.row}><span style={{ color: TEXT2 }}>Safra</span><span style={{ color: TEXT }}>{selected.year}</span></div>
            <div style={S.row}><span style={{ color: TEXT2 }}>Custo</span><span style={{ color: TEXT }}>{fmt(selected.cost)}</span></div>
            <div style={S.rowLast}><span style={{ color: TEXT2 }}>Venda</span><span style={{ color: WINE, fontWeight: 600 }}>{fmt(selected.price)}</span></div>
          </div>
        </div>
        <div style={S.section}>
          <div style={S.sectionLabel}>Estoque por Filial</div>
          <div style={S.card}>
            {BRANCHES.map((b, i) => (
              <div key={b} style={i < BRANCHES.length - 1 ? S.row : S.rowLast}>
                <span style={{ color: TEXT }}>{b}</span>
                <span style={{ color: (stock[b]?.[selected.id] || 0) <= 3 ? "#f87171" : WINE, fontWeight: 600 }}>{stock[b]?.[selected.id] || 0} un.</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "24px 16px" }}>
          <button onClick={() => navigate("movimentacao", selected)} style={S.primaryBtn}>Registrar Movimentação</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerTitle}>Produtos</div>
        {isAdmin && <div style={S.headerRight}><button style={S.iconBtn} onClick={() => navigate("novo_produto")}>＋</button></div>}
      </div>
      <div style={S.searchBar}>
        <span style={{ color: TEXT2 }}>🔍</span>
        <input placeholder="Consulte pelo nome ou tipo" value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
      </div>
      {loading && <div style={{ textAlign: "center", color: TEXT2, padding: 32 }}>Carregando...</div>}
      {!loading && wines.length === 0 && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🏷️</div>
          <div style={{ color: WINE, fontSize: 16, fontWeight: 600 }}>Nenhum produto encontrado.</div>
          {isAdmin && <div style={{ color: TEXT2, fontSize: 14, marginTop: 8 }}>Cadastre clicando no + no canto superior direito.</div>}
        </div>
      )}
      {Object.keys(grouped).sort().map(letter => (
        <div key={letter}>
          <div style={{ padding: "8px 20px 4px", color: TEXT2, fontSize: 13 }}>{letter}</div>
          <div style={{ ...S.card, margin: "0 16px", marginBottom: 8 }}>
            {grouped[letter].map((wine, i) => (
              <div key={wine.id} onClick={() => navigate("produto_detail", wine)} style={{ ...(i < grouped[letter].length - 1 ? S.row : S.rowLast), cursor: "pointer" }}>
                <div style={S.rowLeft}>
                  <div style={{ ...S.rowIcon, background: WINE_DARK }}>🍷</div>
                  <div>
                    <div style={S.rowTitle}>{wine.name}</div>
                    <div style={{ color: WINE, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      🛒 {isAdmin ? BRANCHES.reduce((a, b) => a + (stock[b]?.[wine.id] || 0), 0) : (stock[userBranch]?.[wine.id] || 0)} &nbsp; <span style={{ color: WINE }}>{fmt(wine.price)}</span>
                    </div>
                  </div>
                </div>
                <span style={S.chevron}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VendasTab({ screen, navigate, goBack, wines, stock, clients, sales, isAdmin, userBranch, loadData, showToast, selected }) {
  const [saleForm, setSaleForm] = useState({ clientId: "", branch: userBranch, discount: 0, extra: 0, paid: 0, items: [], date: new Date().toISOString().split("T")[0] });
  const [searchWine, setSearchWine] = useState("");

  const total = saleForm.items.reduce((a, i) => a + i.price * i.qty, 0);
  const totalFinal = total - (saleForm.discount || 0) + (saleForm.extra || 0);
  const debt = Math.max(0, totalFinal - (saleForm.paid || 0));

  const addItem = (wine) => {
    const existing = saleForm.items.find(i => i.wineId === wine.id);
    if (existing) {
      setSaleForm(f => ({ ...f, items: f.items.map(i => i.wineId === wine.id ? { ...i, qty: i.qty + 1 } : i) }));
    } else {
      setSaleForm(f => ({ ...f, items: [...f.items, { wineId: wine.id, name: wine.name, price: wine.price, qty: 1 }] }));
    }
  };

  const handleSave = async () => {
    if (!saleForm.items.length) { showToast("Adicione pelo menos um produto", false); return; }
    const branch = isAdmin ? saleForm.branch : userBranch;
    try {
      for (const item of saleForm.items) {
        const cur = stock[branch]?.[item.wineId] || 0;
        if (cur < item.qty) { showToast(`Estoque insuficiente: ${item.name}`, false); return; }
      }
      const [sale] = await db("sales", { method: "POST", body: JSON.stringify({ branch, client_id: saleForm.clientId || null, total, total_final: totalFinal, discount: saleForm.discount || 0, extra: saleForm.extra || 0, paid: saleForm.paid || 0, debt, items: saleForm.items, sale_date: saleForm.date }) });
      for (const item of saleForm.items) {
        const cur = stock[branch]?.[item.wineId] || 0;
        await db("stock", { method: "POST", prefer: "resolution=merge-duplicates,return=representation", body: JSON.stringify({ wine_id: item.wineId, branch, quantity: cur - item.qty }) });
        await db("movements", { method: "POST", body: JSON.stringify({ wine_id: item.wineId, wine_name: item.name, branch, type: "Saída", quantity: item.qty, user_name: "venda", obs: `Venda #${sale.id?.slice(0, 8)}` }) });
      }
      if (debt > 0 && saleForm.clientId) {
        await db("debts", { method: "POST", body: JSON.stringify({ client_id: saleForm.clientId, sale_id: sale.id, amount: debt, remaining: debt }) });
      }
      showToast("Venda registrada!");
      setSaleForm({ clientId: "", branch: userBranch, discount: 0, extra: 0, paid: 0, items: [], date: new Date().toISOString().split("T")[0] });
      await loadData();
      goBack();
    } catch (e) { showToast("Erro ao salvar venda", false); }
  };

  if (screen === "nova_venda") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Venda</div>
        <div style={S.headerRight}><button style={S.iconBtn} onClick={handleSave}>Salvar</button></div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Cliente (Opcional)</div>
        <div style={S.card}>
          <div style={S.rowLast}>
            <span style={{ color: TEXT2 }}>Cliente</span>
            <select value={saleForm.clientId} onChange={e => setSaleForm(f => ({ ...f, clientId: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none" }}>
              <option value="" style={{ background: CARD }}>Selecionar...</option>
              {clients.map(c => <option key={c.id} value={c.id} style={{ background: CARD }}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Lista de Produtos</div>
        <button onClick={() => navigate("selecionar_produto")} style={{ ...S.primaryBtn, marginBottom: 8 }}>ADD PRODUTO</button>
        {saleForm.items.map(item => (
          <div key={item.wineId} style={{ ...S.card, marginBottom: 8 }}>
            <div style={S.rowLast}>
              <div>
                <div style={{ color: TEXT }}>{item.name}</div>
                <div style={{ color: TEXT2, fontSize: 13 }}>{fmt(item.price)} × {item.qty}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: WINE, fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
                <button onClick={() => setSaleForm(f => ({ ...f, items: f.items.filter(i => i.wineId !== item.wineId) }))} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Opções</div>
        <div style={S.card}>
          <div style={S.row}><span style={{ color: TEXT }}>Data da Venda</span><input type="date" value={saleForm.date} onChange={e => setSaleForm(f => ({ ...f, date: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 14, outline: "none" }} /></div>
          {isAdmin && <div style={S.row}><span style={{ color: TEXT }}>Filial</span><select value={saleForm.branch} onChange={e => setSaleForm(f => ({ ...f, branch: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none" }}>{BRANCHES.map(b => <option key={b} style={{ background: CARD }}>{b}</option>)}</select></div>}
          <div style={S.row}><span style={{ color: TEXT }}>Desconto (R$)</span><input type="number" placeholder="0,00" value={saleForm.discount || ""} onChange={e => setSaleForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))} style={{ background: "none", border: "none", color: "#4ade80", fontSize: 15, outline: "none", textAlign: "right", width: 100 }} /></div>
          <div style={S.rowLast}><span style={{ color: TEXT }}>Adicional (R$)</span><input type="number" placeholder="0,00" value={saleForm.extra || ""} onChange={e => setSaleForm(f => ({ ...f, extra: parseFloat(e.target.value) || 0 }))} style={{ background: "none", border: "none", color: TEXT2, fontSize: 15, outline: "none", textAlign: "right", width: 100 }} /></div>
        </div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Total</div>
        <div style={S.card}>
          <div style={S.row}><span style={{ color: TEXT }}>Produtos</span><span style={{ color: TEXT }}>{fmt(total)}</span></div>
          <div style={S.row}><span style={{ color: TEXT }}>Total Final</span><span style={{ color: WINE, fontWeight: 700 }}>{fmt(totalFinal)}</span></div>
          <div style={S.rowLast}><span style={{ color: TEXT }}>Pago*</span><input type="number" placeholder="0,00" value={saleForm.paid || ""} onChange={e => setSaleForm(f => ({ ...f, paid: parseFloat(e.target.value) || 0 }))} style={{ background: "none", border: "none", color: WINE, fontSize: 16, fontWeight: 700, outline: "none", textAlign: "right", width: 120 }} /></div>
        </div>
        {debt > 0 && <div style={{ marginTop: 8, padding: "10px 14px", background: "#3a1a1a", borderRadius: 10, color: "#f87171", fontSize: 13 }}>Débito gerado: {fmt(debt)}{saleForm.clientId ? " — será vinculado ao cliente" : " — sem cliente selecionado"}</div>}
      </div>
    </div>
  );

  if (screen === "selecionar_produto") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Produtos</div>
      </div>
      <div style={S.searchBar}>
        <span style={{ color: TEXT2 }}>🔍</span>
        <input placeholder="Buscar produto..." value={searchWine} onChange={e => setSearchWine(e.target.value)} style={S.searchInput} />
      </div>
      <div style={{ ...S.card, margin: "0 16px" }}>
        {wines.filter(w => w.name.toLowerCase().includes(searchWine.toLowerCase())).map((wine, i, arr) => (
          <div key={wine.id} onClick={() => { addItem(wine); goBack(); }} style={{ ...(i < arr.length - 1 ? S.row : S.rowLast), cursor: "pointer" }}>
            <div>
              <div style={{ color: TEXT }}>{wine.name}</div>
              <div style={{ color: TEXT2, fontSize: 13 }}>Estoque: {isAdmin ? BRANCHES.reduce((a, b) => a + (stock[b]?.[wine.id] || 0), 0) : (stock[userBranch]?.[wine.id] || 0)}</div>
            </div>
            <span style={{ color: WINE, fontWeight: 600 }}>{fmt(wine.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (screen === "venda_detail" && selected) return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Venda</div>
      </div>
      <div style={S.section}>
        <div style={S.card}>
          <div style={S.row}><span style={{ color: TEXT2 }}>Data</span><span style={{ color: TEXT }}>{fmtDate(selected.created_at)}</span></div>
          <div style={S.row}><span style={{ color: TEXT2 }}>Filial</span><span style={{ color: TEXT }}>{selected.branch}</span></div>
          <div style={S.row}><span style={{ color: TEXT2 }}>Produtos</span><span style={{ color: TEXT }}>{fmt(selected.total)}</span></div>
          <div style={S.row}><span style={{ color: TEXT2 }}>Desconto</span><span style={{ color: "#4ade80" }}>{fmt(selected.discount)}</span></div>
          <div style={S.row}><span style={{ color: TEXT2 }}>Total Final</span><span style={{ color: WINE, fontWeight: 700 }}>{fmt(selected.total_final)}</span></div>
          <div style={S.row}><span style={{ color: TEXT2 }}>Pago</span><span style={{ color: TEXT }}>{fmt(selected.paid)}</span></div>
          <div style={S.rowLast}><span style={{ color: TEXT2 }}>Débito</span><span style={{ color: selected.debt > 0 ? "#f87171" : "#4ade80" }}>{fmt(selected.debt)}</span></div>
        </div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Itens</div>
        <div style={S.card}>
          {(selected.items || []).map((item, i, arr) => (
            <div key={i} style={i < arr.length - 1 ? S.row : S.rowLast}>
              <div style={{ color: TEXT }}>{item.name} × {item.qty}</div>
              <div style={{ color: WINE }}>{fmt(item.price * item.qty)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const branchSales = isAdmin ? sales : sales.filter(s => s.branch === userBranch);
  const todaySales = branchSales.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString());
  const todayTotal = todaySales.reduce((a, s) => a + (s.total_final || 0), 0);

  return (
    <div style={S.screen}>
      <div style={S.header}><div style={S.headerTitle}>Vendas</div></div>
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ ...S.card, padding: 16, marginBottom: 16, background: WINE_DARK }}>
          <div style={{ color: TEXT2, fontSize: 13 }}>Vendas hoje</div>
          <div style={{ color: WINE, fontSize: 28, fontWeight: 700 }}>{fmt(todayTotal)}</div>
          <div style={{ color: TEXT2, fontSize: 13 }}>{todaySales.length} venda(s)</div>
        </div>
        <button onClick={() => navigate("nova_venda")} style={S.primaryBtn}>NOVA VENDA</button>
      </div>
      <div style={{ ...S.card, margin: "0 16px" }}>
        {branchSales.length === 0 && <div style={{ padding: 32, textAlign: "center", color: TEXT2 }}>Nenhuma venda registrada.</div>}
        {branchSales.slice(0, 30).map((sale, i, arr) => (
          <div key={sale.id} onClick={() => navigate("venda_detail", sale)} style={{ ...(i < arr.length - 1 ? S.row : S.rowLast), cursor: "pointer" }}>
            <div>
              <div style={{ color: TEXT }}>Venda #{sale.id?.slice(0, 8)}</div>
              <div style={{ color: TEXT2, fontSize: 13 }}>{fmtDate(sale.created_at)} · {sale.branch}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: WINE, fontWeight: 600 }}>{fmt(sale.total_final)}</div>
              {sale.debt > 0 && <div style={{ color: "#f87171", fontSize: 12 }}>Débito: {fmt(sale.debt)}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientesTab({ screen, navigate, goBack, clients, sales, loadData, showToast, selected }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", birthday: "" });

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Nome obrigatório", false); return; }
    try {
      await db("clients", { method: "POST", body: JSON.stringify({ name: form.name.trim(), phone: form.phone, email: form.email, birthday: form.birthday || null }) });
      showToast("Cliente cadastrado!");
      setForm({ name: "", phone: "", email: "", birthday: "" });
      await loadData();
      goBack();
    } catch { showToast("Erro ao cadastrar", false); }
  };

  if (screen === "novo_cliente") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Novo Cliente</div>
        <div style={S.headerRight}><button style={S.iconBtn} onClick={handleSave}>Salvar</button></div>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={S.section}>
          <div style={S.sectionLabel}>Nome</div>
          <input placeholder="Nome completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={S.input} />
        </div>
        <div style={S.section}>
          <div style={S.card}>
            <div style={S.row}><span style={{ color: TEXT }}>Telefone</span><input placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right" }} /></div>
            <div style={S.row}><span style={{ color: TEXT }}>E-mail</span><input placeholder="email@..." value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right" }} /></div>
            <div style={S.rowLast}><span style={{ color: TEXT }}>Aniversário</span><input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 14, outline: "none" }} /></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "cliente_detail" && selected) {
    const clientSales = sales.filter(s => s.client_id === selected.id);
    const totalGasto = clientSales.reduce((a, s) => a + (s.total_final || 0), 0);
    const totalDebito = clientSales.reduce((a, s) => a + (s.debt || 0), 0);
    return (
      <div style={S.screen}>
        <div style={S.header}>
          <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
          <div style={S.headerTitle}>{selected.name}</div>
        </div>
        <div style={S.section}>
          <div style={S.card}>
            <div style={S.row}><span style={{ color: TEXT2 }}>Telefone</span><span style={{ color: TEXT }}>{selected.phone || "—"}</span></div>
            <div style={S.row}><span style={{ color: TEXT2 }}>E-mail</span><span style={{ color: TEXT }}>{selected.email || "—"}</span></div>
            <div style={S.rowLast}><span style={{ color: TEXT2 }}>Aniversário</span><span style={{ color: TEXT }}>{selected.birthday ? fmtDate(selected.birthday) : "—"}</span></div>
          </div>
        </div>
        <div style={S.section}>
          <div style={S.sectionLabel}>Resumo</div>
          <div style={S.card}>
            <div style={S.row}><span style={{ color: TEXT }}>Total comprado</span><span style={{ color: WINE, fontWeight: 600 }}>{fmt(totalGasto)}</span></div>
            <div style={S.row}><span style={{ color: TEXT }}>Nº de compras</span><span style={{ color: TEXT }}>{clientSales.length}</span></div>
            <div style={S.rowLast}><span style={{ color: TEXT }}>Débito total</span><span style={{ color: totalDebito > 0 ? "#f87171" : "#4ade80", fontWeight: 600 }}>{fmt(totalDebito)}</span></div>
          </div>
        </div>
        <div style={S.section}>
          <div style={S.sectionLabel}>Histórico de Compras</div>
          <div style={S.card}>
            {clientSales.length === 0 && <div style={{ padding: 24, textAlign: "center", color: TEXT2 }}>Nenhuma compra registrada.</div>}
            {clientSales.map((s, i, arr) => (
              <div key={s.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
                <div style={{ color: TEXT2, fontSize: 13 }}>{fmtDate(s.created_at)}</div>
                <div style={{ color: WINE }}>{fmt(s.total_final)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  const birthdays = clients.filter(c => { if (!c.birthday) return false; const b = new Date(c.birthday); return b.getMonth() === today.getMonth(); });

  return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerTitle}>Clientes</div>
        <div style={S.headerRight}><button style={S.iconBtn} onClick={() => navigate("novo_cliente")}>＋</button></div>
      </div>
      {birthdays.length > 0 && (
        <div style={S.section}>
          <div style={{ padding: "10px 14px", background: WINE_DARK, borderRadius: 12, color: WINE, fontSize: 13 }}>
            🎂 {birthdays.length} aniversariante(s) este mês: {birthdays.map(c => c.name).join(", ")}
          </div>
        </div>
      )}
      <div style={{ ...S.card, margin: "16px 16px 0" }}>
        {clients.length === 0 && <div style={{ padding: 32, textAlign: "center", color: TEXT2 }}>Nenhum cliente cadastrado.</div>}
        {clients.map((c, i, arr) => (
          <div key={c.id} onClick={() => navigate("cliente_detail", c)} style={{ ...(i < arr.length - 1 ? S.row : S.rowLast), cursor: "pointer" }}>
            <div style={S.rowLeft}>
              <div style={{ ...S.rowIcon, background: WINE_DARK, fontSize: 20 }}>👤</div>
              <div>
                <div style={S.rowTitle}>{c.name}</div>
                <div style={{ color: TEXT2, fontSize: 13 }}>{c.phone || c.email || "Sem contato"}</div>
              </div>
            </div>
            <span style={S.chevron}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatoriosTab({ wines, stock, sales, movements, expenses, clients, isAdmin, userBranch, screen, navigate, goBack, selected, loadData, showToast }) {
  const [expForm, setExpForm] = useState({ description: "", amount: "", branch: userBranch, category: "Geral" });
  const branch = isAdmin ? null : userBranch;
  const filteredSales = branch ? sales.filter(s => s.branch === branch) : sales;
  const totalSales = filteredSales.reduce((a, s) => a + (s.total_final || 0), 0);
  const totalExpenses = expenses.filter(e => !branch || e.branch === branch).reduce((a, e) => a + (e.amount || 0), 0);
  const totalStock = wines.reduce((acc, w) => {
    if (branch) return acc + (stock[branch]?.[w.id] || 0);
    return acc + BRANCHES.reduce((a, b) => a + (stock[b]?.[w.id] || 0), 0);
  }, 0);
  const totalValue = wines.reduce((acc, w) => {
    const qty = branch ? (stock[branch]?.[w.id] || 0) : BRANCHES.reduce((a, b) => a + (stock[b]?.[w.id] || 0), 0);
    return acc + qty * (w.price || 0);
  }, 0);
  const bestSellers = wines.map(w => {
    const sold = filteredSales.reduce((a, s) => { const item = (s.items || []).find(i => i.wineId === w.id); return a + (item ? item.qty : 0); }, 0);
    return { ...w, sold };
  }).filter(w => w.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 10);
  const lowStockWines = wines.filter(w => {
    const qty = branch ? (stock[branch]?.[w.id] || 0) : BRANCHES.reduce((a, b) => a + (stock[b]?.[w.id] || 0), 0);
    return qty <= 3;
  });

  const handleAddExpense = async () => {
    if (!expForm.description || !expForm.amount) { showToast("Preencha todos os campos", false); return; }
    try {
      await db("expenses", { method: "POST", body: JSON.stringify({ description: expForm.description, amount: parseFloat(expForm.amount), branch: isAdmin ? expForm.branch : userBranch, category: expForm.category }) });
      showToast("Despesa registrada!");
      setExpForm({ description: "", amount: "", branch: userBranch, category: "Geral" });
      await loadData();
      goBack();
    } catch { showToast("Erro", false); }
  };

  if (screen === "despesas") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Despesas</div>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={S.section}>
          <div style={S.card}>
            <div style={S.row}><span style={{ color: TEXT }}>Descrição</span><input placeholder="Ex: Frete" value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right" }} /></div>
            <div style={S.row}><span style={{ color: TEXT }}>Valor (R$)</span><input type="number" placeholder="0,00" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right", width: 100 }} /></div>
            <div style={S.row}><span style={{ color: TEXT }}>Categoria</span><input placeholder="Geral" value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right" }} /></div>
            {isAdmin && <div style={S.rowLast}><span style={{ color: TEXT }}>Filial</span><select value={expForm.branch} onChange={e => setExpForm(f => ({ ...f, branch: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none" }}>{BRANCHES.map(b => <option key={b} style={{ background: CARD }}>{b}</option>)}</select></div>}
          </div>
        </div>
        <button onClick={handleAddExpense} style={S.primaryBtn}>Registrar Despesa</button>
        <div style={S.sectionLabel}>Histórico</div>
        <div style={S.card}>
          {expenses.length === 0 && <div style={{ padding: 24, textAlign: "center", color: TEXT2 }}>Nenhuma despesa.</div>}
          {expenses.slice(0, 30).map((e, i, arr) => (
            <div key={e.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
              <div><div style={{ color: TEXT }}>{e.description}</div><div style={{ color: TEXT2, fontSize: 13 }}>{e.category} · {fmtDate(e.created_at)}</div></div>
              <span style={{ color: "#f87171", fontWeight: 600 }}>{fmt(e.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (screen === "inventario") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Inventário</div>
      </div>
      <div style={S.section}>
        <div style={S.card}>
          <div style={S.row}><span style={{ color: TEXT }}>Total de garrafas</span><span style={{ color: WINE, fontWeight: 600 }}>{totalStock}</span></div>
          <div style={S.row}><span style={{ color: TEXT }}>Valor em estoque</span><span style={{ color: WINE, fontWeight: 600 }}>{fmt(totalValue)}</span></div>
          <div style={S.rowLast}><span style={{ color: TEXT }}>Rótulos ativos</span><span style={{ color: TEXT }}>{wines.length}</span></div>
        </div>
      </div>
      {isAdmin && BRANCHES.map(b => (
        <div key={b} style={S.section}>
          <div style={S.sectionLabel}>{b}</div>
          <div style={S.card}>
            {wines.filter(w => (stock[b]?.[w.id] || 0) > 0).map((w, i, arr) => (
              <div key={w.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
                <span style={{ color: TEXT }}>{w.name}</span>
                <span style={{ color: (stock[b]?.[w.id] || 0) <= 3 ? "#f87171" : WINE }}>{stock[b]?.[w.id] || 0} un.</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {lowStockWines.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionLabel}>⚠ Estoque Crítico (≤ 3 un.)</div>
          <div style={S.card}>
            {lowStockWines.map((w, i, arr) => (
              <div key={w.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
                <span style={{ color: TEXT }}>{w.name}</span>
                <span style={{ color: "#f87171", fontWeight: 600 }}>{BRANCHES.reduce((a, b) => a + (stock[b]?.[w.id] || 0), 0)} un.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (screen === "melhores_vendas") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Melhores Vendas</div>
      </div>
      <div style={{ ...S.card, margin: "16px 16px 0" }}>
        {bestSellers.length === 0 && <div style={{ padding: 32, textAlign: "center", color: TEXT2 }}>Sem dados de vendas.</div>}
        {bestSellers.map((w, i, arr) => (
          <div key={w.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
            <div style={S.rowLeft}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: WINE, color: TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
              <div style={{ color: TEXT }}>{w.name}</div>
            </div>
            <span style={{ color: WINE, fontWeight: 600 }}>{w.sold} un.</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (screen === "balanco") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Balanço Patrimonial</div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Resumo sobre produtos em estoque</div>
        <div style={S.card}>
          <div style={S.row}><span style={{ color: TEXT }}>Quantidade</span><span style={{ color: TEXT }}>{totalStock} un.</span></div>
          <div style={S.row}><span style={{ color: TEXT }}>Venda Total</span><span style={{ color: WINE, fontWeight: 600 }}>{fmt(totalValue)}</span></div>
          <div style={S.row}><span style={{ color: TEXT }}>Total Vendido</span><span style={{ color: "#4ade80", fontWeight: 600 }}>{fmt(totalSales)}</span></div>
          <div style={S.rowLast}><span style={{ color: TEXT }}>Total Despesas</span><span style={{ color: "#f87171", fontWeight: 600 }}>{fmt(totalExpenses)}</span></div>
        </div>
      </div>
    </div>
  );

  if (screen === "lista_vendas") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Lista de Vendas</div>
      </div>
      <div style={{ ...S.card, margin: "16px 16px 0" }}>
        {filteredSales.length === 0 && <div style={{ padding: 32, textAlign: "center", color: TEXT2 }}>Nenhuma venda.</div>}
        {filteredSales.map((s, i, arr) => (
          <div key={s.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
            <div><div style={{ color: TEXT }}>#{s.id?.slice(0, 8)}</div><div style={{ color: TEXT2, fontSize: 13 }}>{fmtDate(s.created_at)} · {s.branch}</div></div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: WINE, fontWeight: 600 }}>{fmt(s.total_final)}</div>
              {s.debt > 0 && <div style={{ color: "#f87171", fontSize: 12 }}>débito</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const sections = [
    { label: "Alerta", items: [
      { icon: "🎂", title: `${clients.filter(c => { if (!c.birthday) return false; const b = new Date(c.birthday); return b.getMonth() === new Date().getMonth(); }).length} aniversariante(s) este mês` },
      { icon: "⚠️", title: `${lowStockWines.length} produto(s) com estoque crítico` },
    ]},
    { label: "Produto", items: [
      { icon: "🏆", title: "Melhores Vendas", screen: "melhores_vendas" },
      { icon: "📦", title: "Inventário", screen: "inventario" },
      { icon: "🔄", title: "Movimentação de Produtos", screen: "movimentacao_lista" },
    ]},
    { label: "Finanças", items: [
      { icon: "💰", title: "Balanço Patrimonial", screen: "balanco" },
      { icon: "📋", title: "Lista de Vendas", screen: "lista_vendas" },
      { icon: "💸", title: "Despesas", screen: "despesas" },
    ]},
    { label: "Cliente", items: [
      { icon: "👑", title: "Melhores Clientes", screen: "melhores_clientes" },
      { icon: "🎂", title: "Aniversariantes do Mês", screen: "aniversariantes" },
    ]},
  ];

  if (screen === "movimentacao_lista") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Movimentações</div>
      </div>
      <div style={{ ...S.card, margin: "16px 16px 0" }}>
        {movements.length === 0 && <div style={{ padding: 32, textAlign: "center", color: TEXT2 }}>Sem movimentações.</div>}
        {movements.slice(0, 50).map((m, i, arr) => (
          <div key={m.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
            <div><div style={{ color: TEXT }}>{m.wine_name}</div><div style={{ color: TEXT2, fontSize: 13 }}>{m.branch} · {fmtDate(m.created_at)}</div></div>
            <span style={{ color: m.type === "Entrada" ? "#4ade80" : m.type === "Saída" ? "#f87171" : "#60a5fa", fontWeight: 600 }}>{m.type === "Saída" ? "-" : "+"}{m.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (screen === "melhores_clientes") {
    const ranked = clients.map(c => ({ ...c, total: sales.filter(s => s.client_id === c.id).reduce((a, s) => a + (s.total_final || 0), 0) })).sort((a, b) => b.total - a.total).filter(c => c.total > 0);
    return (
      <div style={S.screen}>
        <div style={S.header}><div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div><div style={S.headerTitle}>Melhores Clientes</div></div>
        <div style={{ ...S.card, margin: "16px 16px 0" }}>
          {ranked.length === 0 && <div style={{ padding: 32, textAlign: "center", color: TEXT2 }}>Sem dados.</div>}
          {ranked.map((c, i, arr) => (
            <div key={c.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
              <div style={S.rowLeft}><div style={{ width: 28, height: 28, borderRadius: "50%", background: WINE, color: TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</div><span style={{ color: TEXT }}>{c.name}</span></div>
              <span style={{ color: WINE, fontWeight: 600 }}>{fmt(c.total)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === "aniversariantes") {
    const bdays = clients.filter(c => { if (!c.birthday) return false; return new Date(c.birthday).getMonth() === new Date().getMonth(); });
    return (
      <div style={S.screen}>
        <div style={S.header}><div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div><div style={S.headerTitle}>Aniversariantes</div></div>
        <div style={{ ...S.card, margin: "16px 16px 0" }}>
          {bdays.length === 0 && <div style={{ padding: 32, textAlign: "center", color: TEXT2 }}>Nenhum aniversariante este mês.</div>}
          {bdays.map((c, i, arr) => (
            <div key={c.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
              <div style={S.rowLeft}><span style={{ fontSize: 24 }}>🎂</span><span style={{ color: TEXT }}>{c.name}</span></div>
              <span style={{ color: TEXT2, fontSize: 13 }}>{fmtDate(c.birthday)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={S.screen}>
      <div style={S.header}><div style={S.headerTitle}>Relatórios</div></div>
      {sections.map(sec => (
        <div key={sec.label} style={S.section}>
          <div style={S.sectionLabel}>{sec.label}</div>
          <div style={S.card}>
            {sec.items.map((item, i, arr) => (
              <div key={item.title} onClick={() => item.screen && navigate(item.screen)} style={{ ...(i < arr.length - 1 ? S.row : S.rowLast), cursor: item.screen ? "pointer" : "default" }}>
                <div style={S.rowLeft}>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <span style={{ color: TEXT }}>{item.title}</span>
                </div>
                {item.screen && <span style={S.chevron}>›</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuTab({ user, setUser, isAdmin, loadData, showToast, screen, navigate, goBack, selected }) {
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ username: "", password: "senha123", role: "vendedor", branch: BRANCHES[0] });

  useEffect(() => { if (isAdmin) db("profiles?order=role.asc,username.asc").then(setUsers); }, [isAdmin]);

  const handleChangePass = async () => {
    if (passForm.current !== user.password) { showToast("Senha atual incorreta", false); return; }
    if (passForm.next !== passForm.confirm) { showToast("Senhas não coincidem", false); return; }
    if (passForm.next.length < 4) { showToast("Senha muito curta", false); return; }
    await db(`profiles?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ password: passForm.next }) });
    showToast("Senha alterada!");
    setPassForm({ current: "", next: "", confirm: "" });
    goBack();
  };

  const handleAddUser = async () => {
    if (!userForm.username.trim()) { showToast("Usuário obrigatório", false); return; }
    await db("profiles", { method: "POST", body: JSON.stringify({ ...userForm, branch: userForm.role === "admin" ? null : userForm.branch }) });
    showToast("Usuário criado!");
    setUserForm({ username: "", password: "senha123", role: "vendedor", branch: BRANCHES[0] });
    const updated = await db("profiles?order=role.asc,username.asc");
    setUsers(updated);
  };

  const handleDeleteUser = async (u) => {
    if (u.username === "admin") { showToast("Não é possível remover o admin principal", false); return; }
    await db(`profiles?id=eq.${u.id}`, { method: "DELETE", prefer: "" });
    showToast("Usuário removido");
    const updated = await db("profiles?order=role.asc,username.asc");
    setUsers(updated);
  };

  if (screen === "alterar_senha") return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Alterar Senha</div>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={S.section}>
          <div style={S.card}>
            <div style={S.row}><span style={{ color: TEXT }}>Senha Atual</span><input type="password" placeholder="••••" value={passForm.current} onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right", width: 120 }} /></div>
            <div style={S.row}><span style={{ color: TEXT }}>Nova Senha</span><input type="password" placeholder="••••" value={passForm.next} onChange={e => setPassForm(f => ({ ...f, next: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right", width: 120 }} /></div>
            <div style={S.rowLast}><span style={{ color: TEXT }}>Confirmar</span><input type="password" placeholder="••••" value={passForm.confirm} onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right", width: 120 }} /></div>
          </div>
        </div>
        <button onClick={handleChangePass} style={S.primaryBtn}>Salvar</button>
      </div>
    </div>
  );

  if (screen === "usuarios" && isAdmin) return (
    <div style={S.screen}>
      <div style={S.header}>
        <div style={S.headerLeft}><button style={S.backBtn} onClick={goBack}>‹</button></div>
        <div style={S.headerTitle}>Usuários</div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Novo Usuário</div>
        <div style={S.card}>
          <div style={S.row}><span style={{ color: TEXT }}>Usuário</span><input placeholder="nome_usuario" value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right" }} /></div>
          <div style={S.row}><span style={{ color: TEXT }}>Senha</span><input value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none", textAlign: "right" }} /></div>
          <div style={S.row}><span style={{ color: TEXT }}>Perfil</span><select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none" }}><option value="vendedor" style={{ background: CARD }}>Vendedor</option><option value="admin" style={{ background: CARD }}>Admin</option></select></div>
          {userForm.role === "vendedor" && <div style={S.row}><span style={{ color: TEXT }}>Filial</span><select value={userForm.branch} onChange={e => setUserForm(f => ({ ...f, branch: e.target.value }))} style={{ background: "none", border: "none", color: WINE, fontSize: 15, outline: "none" }}>{BRANCHES.map(b => <option key={b} style={{ background: CARD }}>{b}</option>)}</select></div>}
          <div style={S.rowLast}><button onClick={handleAddUser} style={{ ...S.secondaryBtn, width: "100%" }}>Criar Usuário</button></div>
        </div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Usuários Cadastrados</div>
        <div style={S.card}>
          {users.map((u, i, arr) => (
            <div key={u.id} style={i < arr.length - 1 ? S.row : S.rowLast}>
              <div><div style={{ color: TEXT }}>{u.username}</div><div style={{ color: u.role === "admin" ? WINE : TEXT2, fontSize: 13 }}>{u.role} {u.branch ? `· ${u.branch}` : ""}</div></div>
              {u.username !== "admin" && <button onClick={() => handleDeleteUser(u)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 20 }}>×</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const menuItems = [
    { icon: "🍷", title: "Vinhos do Mundo", sub: user.username, isStore: true },
    ...(isAdmin ? [{ icon: "👥", title: "Usuários Adicionais", screen: "usuarios" }] : []),
    { icon: "🔑", title: "Alterar Senha", screen: "alterar_senha" },
    { icon: "🚪", title: "Sair", action: () => setUser(null), red: true },
  ];

  return (
    <div style={S.screen}>
      <div style={S.header}><div style={S.headerTitle}>Menu</div></div>
      <div style={S.section}>
        <div style={S.card}>
          {menuItems.slice(0, 1).map((item, i) => (
            <div key={item.title} style={S.row}>
              <div style={S.rowLeft}>
                <div style={{ ...S.rowIcon, background: WINE_DARK, fontSize: 22 }}>{item.icon}</div>
                <div><div style={{ color: TEXT, fontSize: 17 }}>{item.title}</div><div style={{ color: TEXT2, fontSize: 13 }}>{item.sub}</div></div>
              </div>
            </div>
          ))}
          {isAdmin && (
            <div onClick={() => navigate("usuarios")} style={{ ...S.rowLast, cursor: "pointer" }}>
              <div style={S.rowLeft}>
                <div style={{ ...S.rowIcon, background: WINE_DARK, fontSize: 22 }}>👥</div>
                <span style={{ color: TEXT }}>Usuários Adicionais</span>
              </div>
              <span style={S.chevron}>›</span>
            </div>
          )}
        </div>
      </div>
      <div style={S.section}>
        <div style={S.sectionLabel}>Opções</div>
        <div style={S.card}>
          <div onClick={() => navigate("alterar_senha")} style={{ ...S.row, cursor: "pointer" }}>
            <div style={S.rowLeft}><div style={{ ...S.rowIcon, background: "#2c2c2e", fontSize: 22 }}>🔑</div><span style={{ color: TEXT }}>Alterar Senha</span></div>
            <span style={S.chevron}>›</span>
          </div>
          <div onClick={() => setUser(null)} style={{ ...S.rowLast, cursor: "pointer" }}>
            <div style={S.rowLeft}><div style={{ ...S.rowIcon, background: "#2c1a1a", fontSize: 22 }}>🚪</div><span style={{ color: "#f87171" }}>Sair</span></div>
          </div>
        </div>
      </div>
      <div style={{ padding: "32px 16px", textAlign: "center", color: TEXT2, fontSize: 12 }}>
        Vinhos do Mundo · Controle de Estoque
      </div>
    </div>
  );
}
