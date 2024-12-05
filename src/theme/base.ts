import { PureLightTheme } from './schemes/PureLightTheme';
import { GreyGooseTheme } from './schemes/GreyGooseTheme';
import { PurpleFlowTheme } from './schemes/PurpleFlowTheme';
import { NebulaFighterTheme } from './schemes/NebulaFighterTheme';
import { DarkTheme } from './schemes/DarkTheme';
import { EclipseShadowTheme } from './schemes/EclipseShadowTheme';

const themeMap = {
  PureLightTheme,
  GreyGooseTheme,
  PurpleFlowTheme,
  DarkTheme,
  NebulaFighterTheme,
  EclipseShadowTheme
};

export function themeCreator(theme) {
  return themeMap[theme];
}
