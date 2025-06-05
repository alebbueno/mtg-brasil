"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs/promises");
var path = require("path");
console.log("Executando com Node.js v".concat(process.version));
function fetchMtgTerms(catalogType) {
    return __awaiter(this, void 0, void 0, function () {
        var response, catalog, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://api.scryfall.com/catalog/".concat(encodeURIComponent(catalogType)))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Erro ao buscar ".concat(catalogType, ": ").concat(response.statusText, " (Status: ").concat(response.status, ")"));
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    catalog = _a.sent();
                    return [2 /*return*/, catalog.data];
                case 3:
                    error_1 = _a.sent();
                    console.error("Falha ao buscar ".concat(catalogType, ":"), error_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function translateText(text, type) {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                    console.log("Chamando API: ".concat(apiUrl, "/api/translate para ").concat(type)); // Debug log
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/api/translate"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: text, type: type }),
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.warn("Falha ao traduzir \"".concat(text, "\" (").concat(type, "): ").concat(response.status));
                        return [2 /*return*/, text];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.translation) || text];
                case 3:
                    error_2 = _a.sent();
                    console.error("Erro ao traduzir \"".concat(text, "\" (").concat(type, "):"), error_2);
                    return [2 /*return*/, text];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchDefinition(term) {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                    console.log("Chamando API: ".concat(apiUrl, "/src/api/glossary?term=").concat(term)); // Debug log
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/src/api/glossary?term=").concat(encodeURIComponent(term)))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.warn("Falha ao buscar defini\u00E7\u00E3o para \"".concat(term, "\": ").concat(response.status));
                        return [2 /*return*/, ''];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.definition) || ''];
                case 3:
                    error_3 = _a.sent();
                    console.error("Erro ao buscar defini\u00E7\u00E3o para \"".concat(term, "\":"), error_3);
                    return [2 /*return*/, ''];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function generateGlossary() {
    return __awaiter(this, void 0, void 0, function () {
        var keywordAbilities, abilityWords, allTerms, translatedTerms, output, outputPath, error_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetchMtgTerms('keyword-abilities')];
                case 1:
                    keywordAbilities = _a.sent();
                    return [4 /*yield*/, fetchMtgTerms('ability-words')];
                case 2:
                    abilityWords = _a.sent();
                    allTerms = Array.from(new Set(__spreadArray(__spreadArray([], keywordAbilities, true), abilityWords, true))).sort();
                    console.log("Processando ".concat(allTerms.length, " termos..."));
                    return [4 /*yield*/, Promise.all(allTerms.map(function (term) { return __awaiter(_this, void 0, void 0, function () {
                            var translatedTerm, definitionEn, translatedDefinition, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, translateText(term, 'keyword_en_to_pt')];
                                    case 1:
                                        translatedTerm = _b.sent();
                                        return [4 /*yield*/, fetchDefinition(term)];
                                    case 2:
                                        definitionEn = _b.sent();
                                        if (!definitionEn) return [3 /*break*/, 4];
                                        return [4 /*yield*/, translateText(definitionEn, 'definition_en_to_pt')];
                                    case 3:
                                        _a = _b.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        _a = '';
                                        _b.label = 5;
                                    case 5:
                                        translatedDefinition = _a;
                                        return [2 /*return*/, {
                                                original: term,
                                                translated: translatedTerm,
                                                definition: translatedDefinition,
                                            }];
                                }
                            });
                        }); }))];
                case 3:
                    translatedTerms = _a.sent();
                    output = { terms: translatedTerms };
                    outputPath = path.join(process.cwd(), 'src/app/data/glossaryTerms.json');
                    return [4 /*yield*/, fs.writeFile(outputPath, JSON.stringify(output, null, 2))];
                case 4:
                    _a.sent();
                    console.log("Arquivo gerado com sucesso: ".concat(outputPath));
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _a.sent();
                    console.error('Erro ao gerar glossário:', error_4);
                    throw error_4;
                case 6: return [2 /*return*/];
            }
        });
    });
}
generateGlossary().catch(function (error) {
    console.error('Erro ao executar o script:', error);
    process.exit(1);
});
