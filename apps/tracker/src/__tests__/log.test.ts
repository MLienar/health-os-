import { log } from "@/lib/log";

describe("log", () => {
  it("prefixes every line with [dt] and the scope", () => {
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    log("auth", "signed in");
    log.warn("queue", "replay failed", { attempts: 3 });
    expect(info).toHaveBeenCalledWith("[dt] auth: signed in");
    expect(warn).toHaveBeenCalledWith("[dt] queue: replay failed", { attempts: 3 });
    info.mockRestore();
    warn.mockRestore();
  });
});
