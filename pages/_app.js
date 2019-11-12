import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import App, { Container } from "next/app";
import { AppProvider } from "@shopify/polaris";
import { Provider } from "@shopify/app-bridge-react";
import Cookies from "js-cookie";
import "@shopify/polaris/styles.css";
import translations from "@shopify/polaris/locales/en.json";

const client = new ApolloClient({
  fetchOptions: {
    credentials: "include"
  }
});
class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    const shopOrigin = Cookies.get("shopOrigin");

    const myfunc = async () => {
      let c = await fetch('http://localhost:8081/customers')
      let cObj = await c.json()
      console.log('myFunc',cObj)
    }
    

    myfunc();

    return (
      <Container>
        <AppProvider i18n={translations}>
          <Provider
            config={{
              apiKey: API_KEY,
              shopOrigin: shopOrigin,
              forceRedirect: false
            }}
          >
            <ApolloProvider client={client}>
              <Component {...pageProps} />
            </ApolloProvider>
          </Provider>
        </AppProvider>
      </Container>
    );
  }
}

export default MyApp;
