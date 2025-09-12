import { Navbar } from "../componenets/NavBar";
import { Hero } from "../componenets/Hero";
import { BrowsePage } from "../componenets/BrowsePage";
import { Footer } from "../componenets/Footer";

function Events() {
  return (
    <div>
      <Navbar isLoggedIn={true} />
      <div className="md:mx-[70px] md:mt-5">
        <Hero />
        <BrowsePage />
      </div>
      <Footer />
    </div>
  );
}

export default Events;
