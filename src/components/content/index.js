import instagram from '../../assets/instagram-brands.svg';
import linkedin from '../../assets/linkedin-in-brands.svg';
import twitter from '../../assets/twitter-brands.svg';
import envelope from '../../assets/envelope-regular.svg';
import github from '../../assets/github-brands.svg';



export default {
  data() {
    return {
      items: [
        {
          icon: github,
          herf: 'https://github.com/VitaliiProts',
          alt: 'github'
        },
        {
          icon: linkedin,
          herf: 'https://www.linkedin.com/in/vitalii-prots-495376131',
          alt: 'linkedin',
        },
        {
          icon: instagram,
          herf: 'https://www.instagram.com/vprots_/',
          alt: 'instagram'
        },
        {
          icon: twitter,
          herf: 'https://twitter.com/VitaliyProts',
          alt: 'twitter'
        },
        {
          icon: envelope,
          herf: 'mailto:vitalikprocj@gmail.com',
          alt: 'mail'
        },
      ]
    }
  }
}
