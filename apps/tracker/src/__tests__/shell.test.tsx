import { fireEvent } from "@testing-library/react-native";
import { renderRouter } from "expo-router/testing-library";
import { TABS } from "@/navigation/tabs";
import RootLayout from "../../app/_layout";
import TabsLayout from "../../app/(tabs)/_layout";
import DiaryScreen from "../../app/(tabs)/diary";
import TodayScreen from "../../app/(tabs)/index";
import SettingsScreen from "../../app/(tabs)/settings";
import TrainScreen from "../../app/(tabs)/train";
import TrendsScreen from "../../app/(tabs)/trends";

const routes = {
  _layout: RootLayout,
  "(tabs)/_layout": TabsLayout,
  "(tabs)/index": TodayScreen,
  "(tabs)/diary": DiaryScreen,
  "(tabs)/train": TrainScreen,
  "(tabs)/trends": TrendsScreen,
  "(tabs)/settings": SettingsScreen,
};

// Queries go through the render result rather than the global `screen`: renderRouter does not
// bind RNTL's global screen in this setup.
describe("tab shell", () => {
  it("renders Today at / with all five tabs", async () => {
    const r = renderRouter(routes, { initialUrl: "/" });
    expect(await r.findByTestId("today.root")).toBeTruthy();
    for (const tab of TABS) {
      expect(r.getByTestId(tab.testID)).toBeTruthy();
    }
  });

  it("deep links to a tab", async () => {
    const r = renderRouter(routes, { initialUrl: "/train" });
    expect(await r.findByTestId("train.root")).toBeTruthy();
    expect(r.getByTestId("train.title")).toHaveTextContent("Train");
  });

  it("forces the theme from Settings", async () => {
    const r = renderRouter(routes, { initialUrl: "/settings" });
    await r.findByTestId("settings.root");
    fireEvent.press(r.getByTestId("settings.theme.dark"));
    expect(r.getByTestId("settings.theme.resolved")).toHaveTextContent(/dark/);
  });
});
