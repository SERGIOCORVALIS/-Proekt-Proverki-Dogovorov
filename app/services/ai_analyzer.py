import re
from typing import List, Dict, Any
from app.models.document import RiskLevel

class AIAnalyzer:
    """Service for analyzing legal documents and identifying risks"""
    
    def __init__(self):
        # Define risk patterns and rules
        self.risk_patterns = {
            RiskLevel.HIGH: [
                {
                    "pattern": r"(?i)(без\s+возврата|не\s+возвращается|не\s+подлежит\s+возврату)",
                    "explanation": "Условие о невозврате средств может быть незаконным"
                },
                {
                    "pattern": r"(?i)(односторонний\s+отказ|в\s+одностороннем\s+порядке)",
                    "explanation": "Односторонний отказ от договора может нарушать права сторон"
                },
                {
                    "pattern": r"(?i)(штраф\s+в\s+размере\s+\d+%|\d+%\s+штраф)",
                    "explanation": "Высокие штрафы могут быть признаны несоразмерными"
                },
                {
                    "pattern": r"(?i)(ответственность\s+не\s+ограничена|неограниченная\s+ответственность)",
                    "explanation": "Неограниченная ответственность может быть незаконной"
                }
            ],
            RiskLevel.MEDIUM: [
                {
                    "pattern": r"(?i)(срок\s+действия\s+договора\s+не\s+определен|бессрочный)",
                    "explanation": "Неопределенный срок договора может создавать неопределенность"
                },
                {
                    "pattern": r"(?i)(изменение\s+условий\s+без\s+согласия)",
                    "explanation": "Изменение условий без согласия может нарушать права"
                },
                {
                    "pattern": r"(?i)(конфиденциальность\s+не\s+ограничена)",
                    "explanation": "Неограниченная конфиденциальность может быть избыточной"
                }
            ],
            RiskLevel.LOW: [
                {
                    "pattern": r"(?i)(форс-мажор\s+не\s+предусмотрен)",
                    "explanation": "Отсутствие форс-мажорных обстоятельств может быть рискованным"
                },
                {
                    "pattern": r"(?i)(спорные\s+вопросы\s+решаются\s+в\s+одностороннем\s+порядке)",
                    "explanation": "Одностороннее решение споров может быть несправедливым"
                }
            ]
        }
    
    def analyze_document(self, content: str) -> List[Dict[str, Any]]:
        """Analyze document content and return list of identified risks"""
        risks = []
        
        for risk_level, patterns in self.risk_patterns.items():
            for pattern_info in patterns:
                matches = re.finditer(pattern_info["pattern"], content)
                
                for match in matches:
                    risk = {
                        "level": risk_level,
                        "text": match.group(0),
                        "explanation": pattern_info["explanation"],
                        "start_position": match.start(),
                        "end_position": match.end(),
                        "confidence": self._calculate_confidence(match.group(0), risk_level)
                    }
                    risks.append(risk)
        
        # Remove duplicates and sort by position
        risks = self._remove_duplicates(risks)
        risks.sort(key=lambda x: x["start_position"])
        
        return risks
    
    def _calculate_confidence(self, text: str, risk_level: RiskLevel) -> int:
        """Calculate confidence score for identified risk"""
        base_confidence = {
            RiskLevel.HIGH: 85,
            RiskLevel.MEDIUM: 70,
            RiskLevel.LOW: 60
        }
        
        # Adjust confidence based on text characteristics
        confidence = base_confidence[risk_level]
        
        # Increase confidence for longer, more specific phrases
        if len(text) > 20:
            confidence += 10
        
        # Decrease confidence for very short matches
        if len(text) < 10:
            confidence -= 15
        
        return min(100, max(0, confidence))
    
    def _remove_duplicates(self, risks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate risks based on position overlap"""
        if not risks:
            return risks
        
        # Sort by start position
        risks.sort(key=lambda x: x["start_position"])
        
        filtered_risks = [risks[0]]
        
        for risk in risks[1:]:
            last_risk = filtered_risks[-1]
            
            # Check if risks overlap
            if risk["start_position"] >= last_risk["end_position"]:
                filtered_risks.append(risk)
            else:
                # Keep the risk with higher confidence
                if risk["confidence"] > last_risk["confidence"]:
                    filtered_risks[-1] = risk
        
        return filtered_risks
    
    def get_risk_summary(self, risks: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get summary of risks by level"""
        summary = {
            "total": len(risks),
            "high": len([r for r in risks if r["level"] == RiskLevel.HIGH]),
            "medium": len([r for r in risks if r["level"] == RiskLevel.MEDIUM]),
            "low": len([r for r in risks if r["level"] == RiskLevel.LOW])
        }
        return summary
