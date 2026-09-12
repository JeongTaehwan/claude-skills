// 끼니 v1 프로토타입 — 카탈로그 로더 (이 파일은 생성된다: scratchpad/gen_catalog_v1.py)
// requirements.md v1 미승인 초안 + open-questions.md 추천 답 기준 프로토타입. 정식 구현 아님.
// architecture.md v1 7.1절: JSON을 앱이 직접 import한다(Metro 지원). 런타임 fetch 0.
import type { DeliveryMenu, Ingredient, Recipe, UnitTable } from './engine';

import ingredientsJson from '../catalog/ingredients.json';
import unitsJson from '../catalog/units.json';
import deliveryJson from '../catalog/delivery-menus.json';
import versionJson from '../catalog/version.json';
import r_kimchi_jjigae from '../catalog/recipes/kimchi-jjigae.json';
import r_doenjang_jjigae from '../catalog/recipes/doenjang-jjigae.json';
import r_sundubu_jjigae from '../catalog/recipes/sundubu-jjigae.json';
import r_jeyuk_bokkeum from '../catalog/recipes/jeyuk-bokkeum.json';
import r_so_bulgogi from '../catalog/recipes/so-bulgogi.json';
import r_dakbokkeumtang from '../catalog/recipes/dakbokkeumtang.json';
import r_dakgalbi from '../catalog/recipes/dakgalbi.json';
import r_ojingeo_bokkeum from '../catalog/recipes/ojingeo-bokkeum.json';
import r_godeungeo_gui from '../catalog/recipes/godeungeo-gui.json';
import r_dubu_jorim from '../catalog/recipes/dubu-jorim.json';
import r_gyeranmari from '../catalog/recipes/gyeranmari.json';
import r_miyeokguk from '../catalog/recipes/miyeokguk.json';
import r_japchae from '../catalog/recipes/japchae.json';
import r_kimchi_bokkeumbap from '../catalog/recipes/kimchi-bokkeumbap.json';
import r_omurice from '../catalog/recipes/omurice.json';
import r_curry_rice from '../catalog/recipes/curry-rice.json';
import r_bibim_guksu from '../catalog/recipes/bibim-guksu.json';
import r_janchi_guksu from '../catalog/recipes/janchi-guksu.json';
import r_tteokbokki from '../catalog/recipes/tteokbokki.json';
import r_kimchijeon from '../catalog/recipes/kimchijeon.json';

export const RECIPES: Recipe[] = [
  r_kimchi_jjigae as unknown as Recipe,
  r_doenjang_jjigae as unknown as Recipe,
  r_sundubu_jjigae as unknown as Recipe,
  r_jeyuk_bokkeum as unknown as Recipe,
  r_so_bulgogi as unknown as Recipe,
  r_dakbokkeumtang as unknown as Recipe,
  r_dakgalbi as unknown as Recipe,
  r_ojingeo_bokkeum as unknown as Recipe,
  r_godeungeo_gui as unknown as Recipe,
  r_dubu_jorim as unknown as Recipe,
  r_gyeranmari as unknown as Recipe,
  r_miyeokguk as unknown as Recipe,
  r_japchae as unknown as Recipe,
  r_kimchi_bokkeumbap as unknown as Recipe,
  r_omurice as unknown as Recipe,
  r_curry_rice as unknown as Recipe,
  r_bibim_guksu as unknown as Recipe,
  r_janchi_guksu as unknown as Recipe,
  r_tteokbokki as unknown as Recipe,
  r_kimchijeon as unknown as Recipe,
];

export const INGREDIENTS: Ingredient[] = (ingredientsJson.items as unknown) as Ingredient[];
export const UNITS: UnitTable = (unitsJson as unknown) as UnitTable;
export const DELIVERY_MENUS: DeliveryMenu[] = (deliveryJson.items as unknown) as DeliveryMenu[];
export const CATALOG_VERSION: string = versionJson.catalogVersion;
export const CATALOG_REVIEWED: boolean = versionJson.reviewed;
