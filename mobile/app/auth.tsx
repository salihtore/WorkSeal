import React, { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Redirect } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return <Redirect href="/login" />;
}
