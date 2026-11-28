// Original formative tasks; not official examination questions.
export const tasks = [
 ['l1','Listening','Transport','Pociąg do Poznania odjedzie z peronu trzeciego z dwudziestominutowym opóźnieniem.','Z którego peronu odjedzie pociąg?',['Z pierwszego','Z trzeciego','Z piątego'],1,'Peron trzeci is the departure platform; the delay is twenty minutes.'],
 ['l2','Listening','Healthcare','Dzień dobry, chciałabym przełożyć wizytę z poniedziałku na środę, ponieważ w poniedziałek pracuję.','Dlaczego pacjentka chce zmienić termin?',['Pracuje w poniedziałek','Wyjeżdża w środę','Nie ma dokumentów'],0,'Ponieważ introduces the reason.'],
 ['l3','Listening','Housing','Ogrzewanie nie działa od wczoraj. Fachowiec przyjdzie jutro między ósmą a dziesiątą.','Kiedy przyjdzie fachowiec?',['Dzisiaj wieczorem','Jutro po południu','Jutro rano'],2,'Między ósmą a dziesiątą indicates the morning time window.'],
 ['l4','Listening','Shopping','Jeśli produkt jest uszkodzony, proszę zachować dowód zakupu i skontaktować się z obsługą klienta.','Co należy zachować?',['Opakowanie','Dowód zakupu','Kartę klienta'],1,'Dowód zakupu means proof of purchase.'],
 ['r1','Reading','Government office','Wnioski można składać od poniedziałku do piątku. Zwykle urząd jest czynny do szesnastej, ale w środę do osiemnastej.','Kiedy urząd jest czynny dłużej?',['W środę','W sobotę','W niedzielę'],0,'The notice explicitly mentions Wednesday.'],
 ['r2','Reading','Employment','Proszę przesłać CV do końca tygodnia. Z wybranymi kandydatami skontaktujemy się telefonicznie.','Jak firma skontaktuje się z kandydatami?',['Listownie','Telefonicznie','Osobiście'],1,'Telefonicznie means by telephone.'],
 ['r3','Reading','Banking','Karta jest gotowa do odbioru. Prosimy zabrać dokument tożsamości.','Co trzeba zabrać?',['Umowę najmu','Zdjęcie','Dokument tożsamości'],2,'Dokument tożsamości is an identity document.'],
 ['g1','Grammar','Direction','','Idę do ___ (apteka).',['aptece','apteki','aptekę'],1,'Do requires the genitive.'],
 ['g2','Grammar','Location','','Czekam na kolegę w ___ (biblioteka).',['bibliotece','bibliotekę','biblioteki'],0,'W indicating location takes the locative here.'],
 ['g3','Grammar','Aspect','','Wczoraj wreszcie ___ raport i wysłałem go szefowi.',['pisałem','piszę','napisałem'],2,'Napisałem expresses completion.'],
 ['g4','Grammar','Polite requests','','Czy ___ mi Pani pomóc?',['mogłaby','mogła','mogli' ],0,'Mogłaby is the feminine conditional form used in a polite request.'],
 ['v1','Vocabulary','Government office','','Which expression means submit an application?',['odebrać przesyłkę','złożyć wniosek','zmienić adres'],1,'Learn złożyć wniosek as a phrase.'],
 ['v2','Vocabulary','Housing','','Which expression means report a fault?',['zgłosić usterkę','podpisać umowę','zapłacić czynsz'],0,'Zgłosić usterkę is useful when contacting a landlord.'],
 ['s1','Speaking','Healthcare','Co Panu lub Pani dolega?','Describe symptoms, duration and ask what to do.',null,null,'Od trzech dni boli mnie gardło. Mam też gorączkę. Co mogę zrobić?'],
 ['s2','Speaking','Job interview','Dlaczego chce Pan lub Pani u nas pracować?','Give two reasons and one example.',null,null,'Interesuje mnie ta branża. Mam doświadczenie w obsłudze klientów i chcę rozwijać swoje umiejętności.'],
 ['s3','Speaking','Phone call','Dzień dobry, w czym mogę pomóc?','Arrange an appointment and confirm the time.',null,null,'Chcę umówić się na wizytę. Czy jest wolny termin w piątek rano? Czy godzina dziewiąta jest możliwa?'],
 ['s4','Speaking','Emergency','Co się stało?','Describe the situation, location and help needed.',null,null,'Ktoś źle się poczuł. Jesteśmy przy wejściu do dworca. Proszę wezwać pomoc.'],
 ['w1','Writing','Housing','','Write to your landlord: describe a fault, explain its impact and request a repair.',null,null,'Dzień dobry, od wczoraj nie działa ogrzewanie w mieszkaniu. Jest bardzo zimno, dlatego trudno mi pracować w domu. Czy można umówić fachowca na jutro? Dziękuję za pomoc.'],
 ['w2','Writing','Social life','','Invite a friend, suggest a place and time, and propose an alternative if it rains.',null,null,'Cześć! Może spotkamy się w sobotę o jedenastej w parku? Jeśli będzie padać, pójdziemy do kawiarni. Daj znać, czy Ci pasuje.'],
 ['w3','Writing','Complaints','','Write a complaint: identify a product, describe the problem and request a solution.',null,null,'Dzień dobry, wczoraj kupiłem u Państwa czajnik, który nie działa. Proszę o informację, czy mogę wymienić produkt. Mam dowód zakupu. Z poważaniem.']
].map(([id,skill,topic,source,prompt,options,correct,feedback])=>({id,skill,topic,source,prompt,options,correct,feedback}));
export const skills=['Grammar','Vocabulary','Reading','Listening','Writing','Speaking'];
