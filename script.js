
// Variables globals
let celdaSeleccionada = null;
let numeroRessaltat = null;
let sudokuSolution = ''; 
let sudokuOriginal = ''
let dificultatOriginal = ''
const row_squares = ["A","B","C", "D","E","F", "G","H","I"]
const col_squares = ["1","2","3", "4","5","6", "7","8","9"];
let deferredPrompt;
let dispositiu = 'ordinador'
let activarbackup = true
const strDificultat = { 'molt-facil':'easy', 'facil':'easy', 'mitja':'medium', 'dificil':'hard', 'molt-dur':'very-hard', 'boig':'insane', 'inhuma':'inhuman' }

const CACHE_NAME = '0.01.05';

const sudoVersio = localStorage.getItem('sudoVersio') ?? CACHE_NAME 

const formSettings = document.getElementById('form-settings');
let activarCandidats = localStorage.getItem('settingsCandidats') ?? 'true';
let deshabilitarBotons = (localStorage.getItem('settingsDeshabilitarBotons') ?? 'true') === 'true'
let visualitzarCandidats = (localStorage.getItem('settingsVisualitzarCandidats') ?? 'false') === 'true'

function detectarDispositiu() {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/.test(userAgent)) {
        if (/iPad/.test(userAgent)) {
            return "tauleta";
        } else {
            return "mòbil";
        }
    } else {
        return "ordinador";
    }
}


function mostrarConfirmacio(missatge, callback, btnAccept=true, btnCancel=true, txtAccept='Acceptar', txtCancel='Cancel·lar') {
    const dialog = document.getElementById('confirm-dialog');
    const dialogContent = document.getElementById('confirm-dialog-content');
    const messageElement = document.getElementById('confirm-message');
    const okButton = document.getElementById('confirm-ok');
    const cancelButton = document.getElementById('confirm-cancel');

    okButton.innerText = txtAccept
    cancelButton.innerText = txtCancel

    messageElement.innerHTML = missatge;
    dialog.classList.remove('hidden');

    if (btnAccept) {
        okButton.classList.remove('hidden');
    } else {
        okButton.classList.add('hidden');
    }

    if (btnCancel) {
        cancelButton.classList.remove('hidden');
    } else {
        cancelButton.classList.add('hidden');
    }

    // Funció per gestionar el botó d'acceptar
    function onAccept() {
        tancarDialog();
        callback(true);
    }

    // Funció per gestionar el botó de cancel·lar
    function onCancel() {
        tancarDialog();
        callback(false);
    }

    // Funció per gestionar el clic fora del contingut del diàleg
    function onClickOutside(event) {
        if (!dialogContent.contains(event.target)) {
            tancarDialog();
            callback(false);
        }
    }

    // Funció per tancar el diàleg i eliminar els event listeners
    function tancarDialog() {
        dialog.classList.add('hidden');
        okButton.removeEventListener('click', onAccept);
        cancelButton.removeEventListener('click', onCancel);
        dialog.removeEventListener('click', onClickOutside);
    }

    okButton.addEventListener('click', onAccept);
    cancelButton.addEventListener('click', onCancel);
    dialog.addEventListener('click', onClickOutside);
}


function settingsSudo(){
    document.getElementById('settings-sudo-formulari').classList.toggle('hidden')
}

function saveSudo(){
    document.getElementById('save-sudo-formulari').classList.toggle('hidden')
}


document.getElementById('generar').addEventListener('click', function() {
    const dificultat = document.getElementById('dificultat').value;
    const board = document.getElementById('sudoku-board');

    if (board.innerHTML !== ''){
        mostrarConfirmacio(`Vols generar un nou Sudoku?`, function(confirmar) {
            if (confirmar) {
                generarSudoku(dificultat);
                generarBotonsNumerics();
                activarBotonsPeu();
            }
        });
    }
});

// Afegim l'event listener per comprovar la solució
document.getElementById('comprovar-solucio').addEventListener('click', function() {
    comprovarSolucio();
});

// Afegim l'event listener per comprovar candidats
document.getElementById('comprovar-candidats').addEventListener('click', function() {
    comprovarCandidats();
});


// Afegim l'event listener per canviar el mode
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    toggleDarkMode();
});

document.getElementById('settings-sudo').addEventListener('click', function() {
    displayCandidats('')
    settingsSudo();
});

document.getElementById('tancar-formulari-settings').addEventListener('click', function() {
    document.getElementById('settings-sudo-formulari').classList.add('hidden')
});


document.getElementById('save-sudo').addEventListener('click', function() {
    displayCandidats('')
    saveSudo();
});


document.getElementById('desar-sudo-formulari-save').addEventListener('click', function() {
    saveSudoDesarSudoku();
});
document.getElementById('recuperar-sudo-formulari-save').addEventListener('click', function() {
    saveSudoRecuperarSudoku();
});
document.getElementById('tancar-formulari-save').addEventListener('click', function() {
    closeFormSave()
});

function closeFormSave(){
    document.getElementById('save-sudo-formulari').classList.add('hidden')
}


// Event listener per desar la dificultat seleccionada
document.getElementById('dificultat').addEventListener('change', function() {
    const dificultatSeleccionada = this.value;
    localStorage.setItem('settingsDificultat', dificultatSeleccionada);
});

function separarDigits(cadena, separador = ', ') {
    return (cadena.length === 1) ? cadena : cadena.split('').join(separador);
}

// Funció per actualitzar les icones segons el tema
function actualitzarIcona() {
    const htmlElement = document.documentElement;
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');

    if (htmlElement.classList.contains('dark')) {
        // Si és mode fosc, mostrem la icona del sol
        iconSun.classList.remove('hidden');
        iconMoon.classList.add('hidden');
    } else {
        // Si és mode clar, mostrem la icona de la lluna
        iconSun.classList.add('hidden');
        iconMoon.classList.remove('hidden');
    }
}


formSettings.addEventListener('submit', (event) => {
    event.preventDefault();

    localStorage.setItem('settingsCandidats', document.getElementById('activar-candidats').checked.toString());
    localStorage.setItem('settingsDificultat', document.getElementById('dificultat').value);
    localStorage.setItem('settingsDeshabilitarBotons', document.getElementById('deshabilitar-botons').checked.toString());
    localStorage.setItem('settingsVisualitzarCandidats', document.getElementById('visualitzar-candidats').checked.toString());

    activarCandidats = localStorage.getItem('settingsCandidats');
    deshabilitarBotons = localStorage.getItem('settingsDeshabilitarBotons') === 'true' ;
    visualitzarCandidats = (localStorage.getItem('settingsVisualitzarCandidats') ?? 'false') === 'true'

    displayCandidats('')
    document.getElementById('settings-sudo-formulari').classList.add('hidden')

    activarBotonsPeu();

});


function cracioIncialSudoku(){
    const dificultatSeleccionada = localStorage.getItem('settingsDificultat') ?? 'facil';
    createInitialSudo(dificultatSeleccionada)
}

function implementarVersio(){
    location.reload(true);
}


// En carregar la pàgina
document.addEventListener('DOMContentLoaded', function() {

    if (sudoVersio !== CACHE_NAME){
        implementarVersio()
    }

    dispositiu = detectarDispositiu() // Retorna "mòbil", "tauleta" o "ordinador"
    const htmlElement = document.documentElement;
    const theme = localStorage.getItem('theme');
    document.getElementById('activar-candidats').checked  = activarCandidats === 'true';
    document.getElementById('dificultat-per-defecte').value = localStorage.getItem('settingsDificultat')
    //deshabilitar-botons
    document.getElementById('deshabilitar-botons').checked  = deshabilitarBotons;
    document.getElementById('visualitzar-candidats').checked  = visualitzarCandidats;
    //visualitzar-candidats


    if (theme === 'dark') {
        htmlElement.classList.add('dark');
    } else if (theme === 'light') {
        htmlElement.classList.remove('dark');
    } else {
        // Valor per defecte és mode fosc
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }

    if (visualitzarCandidats) {
        if (dispositiu === 'ordinador'){
            document.getElementById('display-candidadts').classList.remove('hidden')
        } else {
            document.getElementById('display-candidadts-mbl').classList.remove('hidden')
        }
    }

    // Actualitzar les icones en carregar la pàgina
    actualitzarIcona();

    // Carregar la dificultat desada
    const sudoActualBack = localStorage.getItem('sudoActualBack') ?? '';      // Desem el sudoku amb les solucions actuals
        
    displayCandidats('')

    if (sudoActualBack !== ''){
        recuperarSudoBackup()
    } else {
        cracioIncialSudoku()
    }
});

function recuperarSudoBackup(){
    mostrarConfirmacio(`Existeix un sudoku anterior sense resoldre. Vols carregar-lo per continuar jugant?`, function(confirmar) {
        if (confirmar) {
            saveSudoRecuperarSudoku( true )
        } else {
            cracioIncialSudoku()
        }
    }, true, true, 'Correcte','No'); 
}


function createInitialSudo(dificultat){

    document.getElementById('dificultat').value = dificultat;
    // Generar un sudoku amb la dificultat desada
    generarSudoku(document.getElementById('dificultat').value);
    generarBotonsNumerics();
    activarBotonsPeu();

}

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que el navegador mostri el seu propi diàleg
    e.preventDefault();
    // Guardar l'esdeveniment per poder-lo utilitzar més tard
    deferredPrompt = e;
    // Mostrar el botó d'instal·lació
    document.getElementById('install-button').classList.remove('hidden');
  });
  
  document.getElementById('install-button').addEventListener('click', (e) => {
    // Ocultar el botó d'instal·lació
    document.getElementById('install-button').classList.add('hidden');
    // Mostrar el prompt d'instal·lació
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Usuari ha acceptat instal·lar l\'aplicació');
        } else {
            console.log('Usuari ha rebutjat instal·lar l\'aplicació');
        }
        deferredPrompt = null;
    });
});

// Funció per canviar el mode
function toggleDarkMode() {
    const htmlElement = document.documentElement;

    htmlElement.classList.toggle('dark');

    // Guardar la preferència en localStorage
    if (htmlElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }

    // Actualitzar les icones en carregar la pàgina
    actualitzarIcona();
}

function comptarPunts(cadena) {
    const punts = cadena.match(/\./g);
    return punts ? punts.length : 0;
}

function agruparCaracters(cadena) {
    const matriu = [];
    for (let i = 0; i < cadena.length; i += 3) {
        const grup = cadena.slice(i, i + 3);
        matriu.push(grup);
    }
    return matriu;
}

function matriuACadena(matriu) {
    return matriu.join('');
}
function numeroAleatori() {
    return Math.floor(Math.random() * 3); // del 0 al 2
}
function modificarString(str, index, nouCaracter) {
    return str.substring(0, index) + nouCaracter + str.substring(index + 1);
}

function filtraSudoku(cadena){

    const arrayAgrupat = agruparCaracters(cadena) 

    let resultat = agruparCaracters(cadena);
        
    for(var i = 0; i < 3; i++) {
        for(var r = i; r < 27; r=(r+9)) {
            const rInx = [r, (r+3), (r+6)];
            const bloc = resultat[rInx[0]] + resultat[rInx[1]] + resultat[rInx[2]];
            const numPunts = comptarPunts(bloc);
            if (numPunts < 1) {
                for(var a = 0; a < 2; a++) {
                    const numRand = numeroAleatori();
                    const numRandCel·la = numeroAleatori();
                    // Aquí està el canvi principal
                    resultat[rInx[numRand]] = modificarString(resultat[rInx[numRand]], numRandCel·la, '.');
                }
            }
        }
    }

    const novaCadena = matriuACadena(resultat);

    return novaCadena
}


function saveSudoDesarSudoku( backup = false, ret = false ){
    const estatActual = userSolutions()
    if ( backup ){
        localStorage.setItem('sudoActualBack', estatActual);      // Desem el sudoku amb les solucions actuals
        if (ret) return estatActual

    } else {
        localStorage.setItem('sudoOriginal', sudokuOriginal); // Desem el sudoku original
        localStorage.setItem('sudoActual', estatActual);      // Desem el sudoku amb les solucions actuals
        localStorage.setItem('sudoDificultat', dificultatOriginal);   // Desem la dificultat actual del sudoku

        closeFormSave()
    }
}


function saveSudoRecuperarSudoku( backup = false ){
    if ( backup ){
        const sudoDificultatOriginal = localStorage.getItem('sudoDificultatBack')
        generarSudoku(sudoDificultatOriginal, true, true)
        generarBotonsNumerics();
        activarBotonsPeu();

    } else {
        const sudoDificultatOriginal = localStorage.getItem('sudoDificultat')
        document.getElementById('dificultat').value = sudoDificultatOriginal
        closeFormSave()
        generarSudoku(sudoDificultatOriginal, true)
        generarBotonsNumerics();
        activarBotonsPeu();
    }

}


function generarSudoku(dificultat = 'facil', retrieveSavedSudo = false, backup = false) {

    const board = document.getElementById('sudoku-board');

    board.innerHTML = '';

    let nivell = strDificultat[dificultat] ?? 'easy'
    let sudokuString = ''
    let sudoEstatActual = ''
    let sudoOriginal = ''
    let sudoDificultatOriginal = ''
    let sudokuStringOriginal = ''

    if (retrieveSavedSudo) {
        if ( backup ){
            sudoOriginal = localStorage.getItem('sudoOriginalBack');   // Recuperem el sudoku original
            sudoEstatActual = localStorage.getItem('sudoActualBack');    // Repurerem el sudoku amb les solucions del usuari
            sudoDificultatOriginal = localStorage.getItem('sudoDificultatBack');  // Recuperem la dificultat del sudoku original
            dificultatOriginal = sudoDificultatOriginal
            sudokuString = sudoOriginal
            sudokuOriginal = sudokuString
        } else {
            sudoOriginal = localStorage.getItem('sudoOriginal');   // Recuperem el sudoku original
            sudoEstatActual = localStorage.getItem('sudoActual');    // Repurerem el sudoku amb les solucions del usuari
            sudoDificultatOriginal = localStorage.getItem('sudoDificultat');  // Recuperem la dificultat del sudoku original
            dificultatOriginal = sudoDificultatOriginal
            sudokuString = sudoOriginal
            sudokuOriginal = sudokuString
        }

    } else {

        dificultatOriginal = dificultat
        sudokuStringOriginal = sudoku.generate(nivell);

        if (dificultat === 'facil' || dificultat === 'mitja' || dificultat === 'dificil' ) {
            sudokuString = filtraSudoku(sudokuStringOriginal);
        } else {
            sudokuString = sudokuStringOriginal
        }
        
        sudokuOriginal = sudokuString
        sudoEstatActual = sudokuString

        localStorage.setItem('sudoOriginalBack', sudokuOriginal); // Desem el sudoku original
        localStorage.setItem('sudoDificultatBack', dificultatOriginal);   // Desem la dificultat actual del sudoku
        localStorage.setItem('sudoActualBack', '');
    }

    // Generar la solució correcta del sudoku
    sudokuSolution = sudoku.solve(sudokuString); // es la solució des del sudoku generat originalment

    const sudokuArray = sudoku.board_string_to_grid(sudokuString);
    const sudokuArrayEstatActual = sudoku.board_string_to_grid(sudoEstatActual);

    // Reiniciar variables globals
    celdaSeleccionada = null;
    numeroRessaltat = null;

    let n = 0
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cell = document.createElement('div');
            cell.tabIndex = 0; // Fa que l'element sigui focusable
            cell.id = `cell-${i}-${j}`

            // Classes de Tailwind per estilitzar les cel·les
            cell.classList.add(
                'w-20',             // Amplada per defecte (pantalles petites)
                'h-20',             // Alçada per defecte (pantalles petites)
                )
                
            if (dispositiu === 'ordinador'){
                cell.classList.add(
                    'sm:w-14',          // Amplada per a pantalles petites i superiors
                    'sm:h-14',          // Alçada per a pantalles petites i superiors
                    'md:w-14',          // Amplada per a pantalles mitjanes i superiors
                    'md:h-14',          // Alçada per a pantalles mitjanes i superiors
                    'lg:w-14',          // Amplada per a pantalles grans i superiors
                    'lg:h-14',          // Alçada per a pantalles grans i superiors
                    'text-2xl',         // Mida del text per a pantalles petites
                    'sm:text-2xl',       // Mida del text per a pantalles petites i superiors
                    'md:text-4xl',       // Mida del text per a pantalles mitjanes i superiors
                    'lg:text-xl',       // Mida del text per a pantalles grans i superiors
                );
            } else {
                cell.classList.add(
                    'sm:w-22',          // Amplada per a pantalles petites i superiors
                    'sm:h-22',          // Alçada per a pantalles petites i superiors
                    'md:w-24',          // Amplada per a pantalles mitjanes i superiors
                    'md:h-24',          // Alçada per a pantalles mitjanes i superiors
                    'lg:w-14',          // Amplada per a pantalles grans i superiors
                    'lg:h-14',          // Alçada per a pantalles grans i superiors
                    'text-2xl',         // Mida del text per a pantalles petites
                    'sm:text-2xl',       // Mida del text per a pantalles petites i superiors
                    'md:text-4xl',       // Mida del text per a pantalles mitjanes i superiors
                    'lg:text-xl',       // Mida del text per a pantalles grans i superiors
                );
            }
            cell.classList.add(
                'border',
                'border-gray-400',
                'dark:border-gray-50',
                'text-center',
                'font-bold',
                'flex',
                'items-center',
                'justify-center',
                'outline-none',
                'bg-white',
                'dark:bg-gray-800',
                'text-gray-900',
                'dark:text-gray-100',
                'cursor-pointer'       // Canvia el cursor al passar per sobre
                )

            // Afegir vores més gruixudes per als blocs de 3x3
            if (j % 3 === 0) {
                cell.classList.add('border-l-8');
            }
            if (i % 3 === 0) {
                cell.classList.add('border-t-8');
            }
            if (j === 8) {
                cell.classList.add('border-r-8');
            }
            if (i === 8) {
                cell.classList.add('border-b-8');
            }

            // Posició de la cel·la per a futures referències (opcional)
            cell.dataset.row = i;
            cell.dataset.col = j;

            cell.dataset.celda = n;
            n++

            // Deshabilitar les cel·les amb valors predefinits
            if (sudokuArray[i][j] !== '.') {
                cell.textContent = sudokuArray[i][j];
                cell.classList.add(
                    'bg-gray-200',
                    'dark:bg-neutral-700',
                    'font-normal',
                    'text-gray-900',
                    'dark:text-gray-100',
                    'cursor-pointer'    // Cursor pointer per indicar que es pot clicar
                );
                cell.dataset.prefilled = 'true'; // Marquem la cel·la com a predefinida
            } else{
                cell.dataset.error = 'false';
                cell.classList.add(
                    'focus:bg-yellow-100',
                    'dark:focus:bg-yellow-900'
                )
                if (sudokuArrayEstatActual[i][j] !== '.' && (retrieveSavedSudo) ){
                    cell.textContent = sudokuArrayEstatActual[i][j];
                }
            }

            // Afegir event per a totes les cel·les
            cell.addEventListener('click', function() {
                // Lògica per a la cel·la seleccionada (només si és editable)
                if (cell.dataset.prefilled !== 'true') {
                    // Si la cel·la ja està seleccionada, la desmarquem
                    if (celdaSeleccionada === this) {
                        celdaSeleccionada.classList.remove('bg-yellow-200', 'dark:bg-yellow-800');
                        celdaSeleccionada = null;
                        if (visualitzarCandidats) displayCandidats('')
                    } else {
                        // Si hi ha una altra cel·la seleccionada, la desmarquem
                        if (celdaSeleccionada) {
                            celdaSeleccionada.classList.remove('bg-yellow-200', 'dark:bg-yellow-800');
                            if (visualitzarCandidats) displayCandidats('')
                        }
                        // Marquem aquesta cel·la com a seleccionada
                        celdaSeleccionada = this;
                        this.classList.add('bg-yellow-200', 'dark:bg-yellow-800');
                        if (visualitzarCandidats) comprovarCandidats()
                    }
                        
                } else {
                    if (visualitzarCandidats) displayCandidats('')
                }

                // Lògica per ressaltar números
                ressaltarNumeros(this);
            });

            board.appendChild(cell);
        }
    }
}

function userSolutions(){
    let totesLesCel·les = document.querySelectorAll('#sudoku-board div');
    let userSolution = '';

    totesLesCel·les.forEach(function(celda) {
        let valor = celda.textContent;
        if (valor >= '1' && valor <= '9') {
            userSolution += valor;
        } else {
            userSolution += '.';
        }
    });

    return userSolution

}

function activarBotonsPeu(){
    document.getElementById('comprovar-solucio').classList.remove('hidden')
    if ( activarCandidats === 'true' && !visualitzarCandidats ) {
        document.getElementById('comprovar-candidats').classList.remove('hidden')
    } else {
        document.getElementById('comprovar-candidats').classList.add('hidden')
    }
}

function comprovarSolucio() {

    displayCandidats('')

    const userSolution = userSolutions()
    if (userSolution.indexOf(".") !== -1){
        mostrarConfirmacio(`<p><b>Et falten caselles per resoldre.</b></p>`, function(confirmar) {}, true, false ); 
        return
    }

    if (userSolution === sudokuSolution) {
        mostrarConfirmacio(`<p><b>Felicitats! Has resolt correctament el sudoku.</b></p>`, function(confirmar) {}, true, false ); 
        localStorage.setItem('sudoOriginalBack', ''); // Desem el sudoku original
        localStorage.setItem('sudoDificultatBack', '');   // Desem la dificultat actual del sudoku
        localStorage.setItem('sudoActualBack', '');      // Desem el sudoku amb les solucions actuals
    } else {
        mostrarConfirmacio(`<p><b>Hi ha errors en la teva solució. Revisa les caselles i torna a intentar-ho.</b></p>`, function(confirmar) {}, true, false ); 
    }
}

function displayCandidats(text){

    if (dispositiu === 'ordinador'){
        document.getElementById('display-candidadts').innerHTML= text
    } else {
        document.getElementById('display-candidadts-mbl').innerHTML= text
    }
}

function comprovarCandidats(){

    if (celdaSeleccionada && celdaSeleccionada.dataset.prefilled !== 'true') {

        const userSolution = userSolutions()
        const getCandidats = sudoku.get_candidates(userSolution)

        const row = celdaSeleccionada.dataset.row
        const col = celdaSeleccionada.dataset.col

        const viewCandidats = separarDigits(getCandidats[row][col])
        if (visualitzarCandidats){
            displayCandidats(`Candidats: ${viewCandidats}`)
        } else {
            mostrarConfirmacio(`Els candidats son:<br> <p><b> ${viewCandidats}</b></p>`, function(confirmar) {}, true, false ); 
        }

    }

}

function sudoBackup(){
    saveSudoDesarSudoku()
}

function checkQuantityNumber(cadena, valor ) {
    const regex = new RegExp(valor, 'g');
    const repeticions = cadena.match(regex);
    return repeticions ? repeticions.length : 0;
}


function setValueCell(celdaSeleccionada, value){

    const valueActual = celdaSeleccionada.textContent
    
    celdaSeleccionada.textContent = value;

    //const cadena = saveSudoDesarSudoku( true, true )
    const cadena = userSolutions()
        
    if ( !deshabilitarBotons ) {
        if ( value !== '' ) {
            const numRepe = checkQuantityNumber( cadena, value )
            if ( numRepe >= 9 ) { 
                disabledButtonNum( value ) 
            } else {
                enabledButtonNum( value ) 
            }
        }
        if ( valueActual !== '' ) {
            const numRepe = checkQuantityNumber( cadena, valueActual )
            if ( numRepe >= 9 ) { 
                disabledButtonNum( valueActual ) 
            } else {
                enabledButtonNum( valueActual ) 
            }
        }
    }

    if (cadena.indexOf(".") === -1){
        comprovarSolucio()
    }
}


function generarBotonsNumerics() {

    const estatActual = userSolutions()
    const numberButtons = document.getElementById('number-buttons');
    numberButtons.innerHTML = '';

    // Ajustem el grid a 5 columnes
    numberButtons.classList.remove('grid-cols-9', 'grid-cols-5');
    numberButtons.classList.add('grid-cols-5');

    // Crear els botons numèrics de l'1 al 9
    for (let i = 1; i <= 9; i++) {

        let button = document.createElement('button');
        button.textContent = i;
        button.value = i;
        button.id = "button-num-" + i

        const numRepe = checkQuantityNumber( estatActual, i )
        if ( numRepe >= 9 ) button.disabled = true

        // Classes de Tailwind per estilitzar els botons
        if (dispositiu === 'ordinador'){
            button.classList.add(
                'bg-blue-500',
                'hover:bg-blue-600',
                'disabled:bg-blue-50',
                'disabled:hover:bg-blue-50',
                'disabled:text-gray-500',
                'text-white',
                'font-bold',
                'py-1',
                'px-1',
                'rounded',
                'text-2xl',
                'm-1',
                'w-full'
            );
        } else{
            button.classList.add(
                'bg-blue-500',
                'hover:bg-blue-600',
                'disabled:bg-blue-50',
                'disabled:hover:bg-blue-50',
                'disabled:text-gray-500',
                'text-white',
                'font-bold',
                'py-6',
                'px-6',
                'rounded',
                'text-4xl',
                'm-1',
                'w-full'
            );
        }
        button.addEventListener('click', function() {
            if (celdaSeleccionada && celdaSeleccionada.dataset.prefilled !== 'true') {
                // Obtenim el valor actual de la cel·la
                let valorActual = celdaSeleccionada.textContent;
                let nouValor = this.value;
        
                // Si la cel·la està buida o té el mateix valor, simplement inserim el número
                if (!valorActual || valorActual === nouValor) {
                    //celdaSeleccionada.textContent = nouValor;
                    setValueCell(celdaSeleccionada, nouValor)
                } else {
                    // Si el valor és diferent, preguntem a l'usuari si vol modificar-lo
                    mostrarConfirmacio(`La cel·la ja conté el número ${valorActual}. Vols canviar-lo per ${nouValor}?`, function(confirmar) {
                        if (confirmar) {
                            //celdaSeleccionada.textContent = nouValor;
                            setValueCell(celdaSeleccionada, nouValor)
                        }
                    });                    
                }
                comprovarCeldaError(celdaSeleccionada)
            }
        });
        

        numberButtons.appendChild(button);
    }

    // Crear el botó d'esborrar
    let deleteButton = document.createElement('button');
    let ampladaBotoDel = 'h-12 w-12'
    if (dispositiu === 'ordinador'){
        ampladaBotoDel = 'h-8 w-8'
        deleteButton.classList.add(
            'bg-red-500',
            'hover:bg-red-600',
            'text-white',
            'font-bold',
            'py-1',
            'px-1',
            'rounded',
            'text-4xl',
            'm-1',
            'w-full'
        );
    } else {
        deleteButton.classList.add(
            'bg-red-500',
            'hover:bg-red-600',
            'text-white',
            'font-bold',
            'py-6',
            'px-6',
            'rounded',
            'text-4xl',
            'm-1',
            'w-full'
        );
    }

    deleteButton.innerHTML = `
        <svg class="${ampladaBotoDel}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M19 19h-11l-4 -4a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9 9" />  <path d="M18 12.3l-6.3 -6.3" /></svg>
    `;
    
    deleteButton.title = 'Esborrar valor';

    deleteButton.addEventListener('click', function() {
        if (celdaSeleccionada && celdaSeleccionada.dataset.prefilled !== 'true') {
            if (celdaSeleccionada.textContent !== '') {
                mostrarConfirmacio(`Vols esborrar el valor de la cel·la seleccionada?`, function(confirmar) {
                    if (confirmar) {
                        //celdaSeleccionada.textContent = '';
                        setValueCell(celdaSeleccionada, '')
                    }
                });
                
            }
        }
    });
    

    numberButtons.appendChild(deleteButton);

    // Ajustem l'espai entre els botons si cal
    if (dispositiu === 'ordinador'){
        numberButtons.classList.add('gap-3')
    } else {
        numberButtons.classList.add('gap-6')
    }
}

function disabledButtonNum( num ){
    //button.id = "button-num-" + i
    document.getElementById("button-num-" + num ).disabled = true;
}

function enabledButtonNum( num ){
    //button.id = "button-num-" + i
    document.getElementById("button-num-" + num ).disabled = false;
}


function comprovarCeldaError(celda){
    let valor = celda.textContent;
    let n =  parseInt(celda.dataset.celda, 10)
    const carSolucio = sudokuSolution[n]
}

// Funcions per ressaltar números
function ressaltarNumeros(celda) {
    let valor = celda.textContent;

    // Si la cel·la no té valor, desressaltem qualsevol ressaltat
    if (!valor) {
        desressaltarTotesLesCel·les();
        numeroRessaltat = null;
        return;
    }

    // Si el número clicat és el mateix que el ressaltat, eliminem el ressaltat
    if (numeroRessaltat === valor) {
        desressaltarTotesLesCel·les();
        numeroRessaltat = null;
    } else {
        // Si hi ha un altre número ressaltat, el desressaltem
        if (numeroRessaltat !== null) {
            desressaltarTotesLesCel·les();
        }

        numeroRessaltat = valor;
        // Ressaltem totes les cel·les amb aquest número
        ressaltarCel·lesAmbNumero(valor);
    }
}

function ressaltarCel·lesAmbNumero(numero) {
    let totesLesCel·les = document.querySelectorAll('#sudoku-board div');

    totesLesCel·les.forEach(function(celda) {
        if (celda.textContent === numero) {
            celda.classList.add('bg-green-200', 'dark:bg-green-700');
        }
    });
}

function desressaltarTotesLesCel·les() {
    let totesLesCel·les = document.querySelectorAll('#sudoku-board div');

    totesLesCel·les.forEach(function(celda) {
        celda.classList.remove('bg-green-200', 'dark:bg-green-700');
    });
}



// Codi JavaScript per mostrar el punt de ruptura actual amb Tailwind
function getBreakpoint() {
    const width = window.innerWidth;
    if (width >= 1536) return '2xl';
    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';
    if (width >= 640) return 'sm';
    return 'xs'; // Punt de ruptura per menys de 640px
}
  
  // Funció per mostrar el punt de ruptura en un element de la pàgina
function showBreakpoint() {
    const element = document.getElementById('breakpoint-indicator');
    const dispositiu = detectarDispositiu()

    element.innerText = `Breakpoint: ${getBreakpoint()}, Dispositiu: ${dispositiu}, Versió: ${CACHE_NAME} `;
    
    
}
  
  // Actualitza el punt de ruptura quan es redimensiona la finestra
window.addEventListener('resize', showBreakpoint);
  
  // Inicialitza en carregar la pàgina
window.addEventListener('load', showBreakpoint);

//const CACHE_NAME = 'sudoku-cache-v7';
// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./sw.js').then(function(registration) {
        console.log('Service Worker registrat amb èxit:', registration.scope);

      }, function(err) {
        console.log('Error al registrar el Service Worker:', err);
      });
    });
}
  

//////////////////////////////////
// https://github.com/robatron/sudoku.js/tree/master