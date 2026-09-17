// @testing-library/react-native v13+ registers its Jest matchers automatically.
// Silence the [dt] logger's debug channel in tests unless a test opts in.
jest.spyOn(console, "debug").mockImplementation(() => {});
