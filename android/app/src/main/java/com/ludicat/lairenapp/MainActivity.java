package com.ludicat.lairenapp;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;

import androidx.core.graphics.Insets;
import androidx.core.view.OnApplyWindowInsetsListener;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Edge-to-edge moderno
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

    // Barras transparentes
    getWindow().setStatusBarColor(Color.TRANSPARENT);
    getWindow().setNavigationBarColor(Color.TRANSPARENT);
    if (Build.VERSION.SDK_INT >= 29) {
      getWindow().setNavigationBarContrastEnforced(false);
    }

    // Pasar insets a la WebView como variables CSS
    final View root = getWindow().getDecorView();
    ViewCompat.setOnApplyWindowInsetsListener(root, new OnApplyWindowInsetsListener() {
      @Override
      public WindowInsetsCompat onApplyWindowInsets(View v, WindowInsetsCompat insets) {
        Insets sb = insets.getInsets(WindowInsetsCompat.Type.systemBars());

        final String js =
          "document.documentElement.style.setProperty('--android-inset-top','" + sb.top + "px');" +
          "document.documentElement.style.setProperty('--android-inset-bottom','" + sb.bottom + "px');";

        if (bridge != null && bridge.getWebView() != null) {
          // Ejecutar JS en el hilo de la WebView
          bridge.getWebView().post(new Runnable() {
            @Override public void run() {
              bridge.getWebView().evaluateJavascript(js, (ValueCallback<String>) null);
              // Alternativa (menos recomendada): bridge.getWebView().loadUrl("javascript:" + js);
            }
          });
        }
        return insets;
      }
    });
  }
}
