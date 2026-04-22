import HomeHeader from './HomeHeader';
import HomePromo from './HomePromo';
import HomeProducts from './HomeProducts';
import HomeFeatures from './HomeFeatures';
import HomeTrust from './HomeTrust';
import HomeFooter from './HomeFooter';
import HomeHero from './HomeHero';

export default function HomeHomepage({ hero, children }) {
  return (
    <div className="Home-homepage">
      <HomeHeader />
      {hero || <HomeHero>{children}</HomeHero>}
      <HomePromo />
      <HomeProducts />
      <HomeFeatures />
      <HomeTrust />
      <HomeFooter />
    </div>
  );
}
