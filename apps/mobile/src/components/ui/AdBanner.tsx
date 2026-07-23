import { Platform, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

function getBannerUnitId(): string {
  const envId =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_IOS
      : process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID;
  // Falls back to Google's public test unit id until a real AdMob account exists
  // (noazul-blueprint.md §4 Fase 5 blocker) — never ships a blank/broken banner.
  return envId || TestIds.BANNER;
}

/**
 * The app's ONE ad surface (see Fase 5 acceptance criteria: exactly one
 * banner, no interstitials — there is no interstitial code anywhere in this
 * app). Callers are responsible for only rendering this for non-premium
 * users and for keeping it away from money values.
 */
export function AdBanner() {
  return (
    <View className="items-center border-t border-gray-100 bg-white py-1 dark:border-gray-800 dark:bg-gray-900">
      <BannerAd unitId={getBannerUnitId()} size={BannerAdSize.BANNER} />
    </View>
  );
}
